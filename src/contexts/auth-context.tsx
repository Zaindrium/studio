
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp, collection, query, getDocs, limit, orderBy, startAfter, DocumentSnapshot, endBefore, limitToLast } from 'firebase/firestore';
import type { AdminUser, CompanyProfile, PlanId, StaffRecord, Team, Role } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types';

const DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY: PlanId = APP_PLANS.find(p => p.id === 'growth')?.id || 'growth';
const LOWEST_TIER_PLAN_ID: PlanId = APP_PLANS.find(p => p.id === 'free')?.id || 'free';
const INITIAL_FETCH_LIMIT = 10; 

interface AuthContextType {
  currentUser: (FirebaseUser & { adminProfile?: AdminUser }) | null;
  loading: boolean;
  companyId: string | null;
  companyProfile: CompanyProfile | null;
  activePlanId: PlanId | null;
  updateCompanyPlan: (planId: PlanId) => Promise<void>;
  fetchCompanyProfile: () => Promise<void>; // Kept for manual refresh scenarios if ever needed
  isInitialDataLoaded: boolean; 
  staffListCache: StaffRecord[] | null; 
  teamsListCache: Team[] | null;
  adminListCache: AdminUser[] | null;
  rolesListCache: Role[] | null;
  fetchAndCacheStaff: (companyId: string, lastDoc?: DocumentSnapshot) => Promise<{newStaffList: StaffRecord[], newLastDoc?: DocumentSnapshot}>; 
  fetchAndCacheTeams: (companyId: string) => Promise<void>;
  fetchAndCacheAdmins: (companyId: string) => Promise<void>;
  fetchAndCacheRoles: (companyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<(FirebaseUser & { adminProfile?: AdminUser }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [activePlanId, setActivePlanId] = useState<PlanId | null>(null);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const [staffListCache, setStaffListCache] = useState<StaffRecord[] | null>(null);
  const [teamsListCache, setTeamsListCache] = useState<Team[] | null>(null);
  const [adminListCache, setAdminListCache] = useState<AdminUser[] | null>(null);
  const [rolesListCache, setRolesListCache] = useState<Role[] | null>(null);
  
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
    if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast({ title, description, variant, duration: variant === "destructive" ? 9000 : 5000 });
    }
  };

  // This specific fetch function is now primarily for manual refresh if needed elsewhere, 
  // as onAuthStateChanged handles initial fetch-or-create.
  const fetchCompanyProfileData = useCallback(async (cid: string) => {
    if (!cid) {
      setCompanyProfile(null);
      setActivePlanId(null);
      return;
    }
    try {
      const companyRef = doc(db, "companies", cid);
      const companyDocSnap = await getDoc(companyRef);
      if (companyDocSnap.exists()) {
        const companyData = companyDocSnap.data() as CompanyProfile;
        setCompanyProfile(companyData);
        setActivePlanId(companyData.activePlanId || LOWEST_TIER_PLAN_ID);
      } else {
        console.warn(`Company profile not found via manual fetch for ID: ${cid}. This implies an issue if user is logged in.`);
        setCompanyProfile(null);
        setActivePlanId(LOWEST_TIER_PLAN_ID); 
      }
    } catch (error: any) {
      console.error("Error fetching company profile via manual fetch:", error);
      setCompanyProfile(null);
      setActivePlanId(LOWEST_TIER_PLAN_ID);
      if (error.code === 'permission-denied') {
        showToast("Permission Denied", "Failed to fetch company profile. Check Firestore rules.", "destructive");
      } else {
        showToast("Error", `Failed to fetch company profile: ${error.message || 'Unknown error'}.`, "destructive");
      }
    }
  }, []);

  const updateCompanyPlan = useCallback(async (planId: PlanId) => {
    if (companyId) {
      try {
        const companyRef = doc(db, "companies", companyId);
        await updateDoc(companyRef, { activePlanId: planId, updatedAt: serverTimestamp() });
        setActivePlanId(planId);
        setCompanyProfile(prev => prev ? { ...prev, activePlanId: planId, updatedAt: serverTimestamp() as Timestamp } : null);
        showToast("Plan Updated", `Your subscription plan has been changed.`);
      } catch (error: any) {
        console.error("Error updating company plan in Firestore:", error);
        if (error.code === 'permission-denied') {
           showToast("Permission Denied", "Failed to update plan. Check Firestore rules.", "destructive");
        } else {
           showToast("Error", `Could not update plan: ${error.message || 'Unknown error'}.`, "destructive");
        }
        throw error;
      }
    } else {
      const noCompanyIdError = "Company ID not available to update plan.";
      console.error(noCompanyIdError);
      showToast("Error", noCompanyIdError, "destructive");
      throw new Error(noCompanyIdError);
    }
  }, [companyId]);

  const fetchAndCacheFactory = <T extends { id: string }>(
    collectionName: string,
    setter: React.Dispatch<React.SetStateAction<T[] | null>>,
    cacheName: string,
    shouldPaginate: boolean = false 
  ) => {
    return useCallback(async (cid: string, lastDoc?: DocumentSnapshot): Promise<{newList: T[], newLastDoc?: DocumentSnapshot}> => {
      if (!cid) {
        setter(null);
        return { newList: [], newLastDoc: undefined };
      }
      try {
        const collectionRef = collection(db, `companies/${cid}/${collectionName}`);
        let q;
        if (shouldPaginate) {
            // Example: order by name for staff, can be made more generic if needed
            const orderByField = collectionName === 'staff' ? 'name' : 'createdAt'; // staff by name, others by createdAt
            q = query(collectionRef, orderBy(orderByField), limit(INITIAL_FETCH_LIMIT)); 
            if (lastDoc) {
                q = query(collectionRef, orderBy(orderByField), startAfter(lastDoc), limit(INITIAL_FETCH_LIMIT));
            }
        } else {
            q = query(collectionRef, orderBy("name")); // Default: order by name for non-paginated, or choose another default like createdAt
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedItems: T[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as T));
        
        if (shouldPaginate && collectionName === 'staff') { // Only apply special pagination cache handling for staff for now
            setter(prev => {
                if (!lastDoc) return fetchedItems; // First page, replace cache
                const combined = prev ? [...prev, ...fetchedItems] : fetchedItems;
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique;
            });
            return { newList: fetchedItems, newLastDoc: querySnapshot.docs[querySnapshot.docs.length -1] };
        } else {
            setter(fetchedItems); // For non-staff or non-paginated, replace cache directly
            return { newList: fetchedItems, newLastDoc: shouldPaginate ? querySnapshot.docs[querySnapshot.docs.length -1] : undefined };
        }

      } catch (error: any) {
        console.error(`Error fetching ${cacheName} for cache:`, error);
        setter(prev => prev || []); // Keep existing cache on error, or empty array if null
        if (error.code === 'permission-denied') {
            showToast("Permission Denied", `Could not fetch ${cacheName}. Check Firestore rules.`, "destructive");
        }
        return { newList: [], newLastDoc: undefined };
      }
    }, [setter, collectionName, cacheName, shouldPaginate]);
  };

  const fetchAndCacheStaff = fetchAndCacheFactory<StaffRecord>("staff", setStaffListCache, "staff list", true);
  const fetchAndCacheTeams = fetchAndCacheFactory<Team>("teams", setTeamsListCache, "teams list");
  const fetchAndCacheAdmins = fetchAndCacheFactory<AdminUser>("admins", setAdminListCache, "admins list");
  const fetchAndCacheRoles = fetchAndCacheFactory<Role>("roles", setRolesListCache, "roles list");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setIsInitialDataLoaded(false);
      // Clear all caches on auth state change initially
      setCompanyProfile(null); setActivePlanId(null); setStaffListCache(null);
      setTeamsListCache(null); setAdminListCache(null); setRolesListCache(null);

      if (user) {
        const currentCompanyId = user.uid; 
        setCompanyId(currentCompanyId);
        
        let fetchedAdminProfile: AdminUser | undefined;
        try {
          const adminUserRef = doc(db, `companies/${currentCompanyId}/admins/${user.uid}`);
          let adminDocSnap = await getDoc(adminUserRef);

          if (!adminDocSnap.exists()) {
            console.log(`Admin profile for ${user.uid} not found. Creating one.`);
            const defaultAdminName = user.displayName || user.email?.split('@')[0] || 'Admin User';
            const defaultCompanyNameForAdmin = `${defaultAdminName}'s Company`; // Used for admin's companyName field
            const newAdminProfileData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'> = {
              companyId: currentCompanyId,
              companyName: defaultCompanyNameForAdmin, // This is AdminUser.companyName
              name: defaultAdminName,
              email: user.email || "",
              emailVerified: user.emailVerified,
              role: 'Owner',
              status: 'Active',
            };
            await setDoc(adminUserRef, { ...newAdminProfileData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            adminDocSnap = await getDoc(adminUserRef); // Re-fetch after creation
          }
          fetchedAdminProfile = adminDocSnap.data() as AdminUser; 
          setCurrentUser({ ...user, adminProfile: fetchedAdminProfile });

          // Fetch-or-create Company Profile
          const companyRef = doc(db, "companies", currentCompanyId);
          let companyDocSnap = await getDoc(companyRef);

          if (!companyDocSnap.exists()) {
            console.warn(`Company profile for ${currentCompanyId} not found. Creating one.`);
            const companyNameToSet = fetchedAdminProfile?.companyName || `${fetchedAdminProfile?.name || 'Business'}'s Company`;
            const newCompanyProfileData: CompanyProfile = {
              id: currentCompanyId,
              name: companyNameToSet,
              activePlanId: DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(companyRef, newCompanyProfileData);
            companyDocSnap = await getDoc(companyRef); // Re-fetch
          }

          if (companyDocSnap.exists()) {
            const companyData = companyDocSnap.data() as CompanyProfile;
            setCompanyProfile(companyData);
            setActivePlanId(companyData.activePlanId || LOWEST_TIER_PLAN_ID);
          } else {
            console.error(`CRITICAL: Company profile for ${currentCompanyId} still not found after attempting creation.`);
            setCompanyProfile(null); // Should ideally not happen
            setActivePlanId(LOWEST_TIER_PLAN_ID);
          }

          // Prefetch initial data for dashboard lists
          Promise.allSettled([
            fetchAndCacheStaff(currentCompanyId), 
            fetchAndCacheTeams(currentCompanyId),
            fetchAndCacheAdmins(currentCompanyId),
            fetchAndCacheRoles(currentCompanyId),
          ]).then(results => {
            results.forEach(result => {
              if (result.status === 'rejected') console.error("Error during initial data prefetch:", result.reason);
            });
          }).finally(() => {
            setIsInitialDataLoaded(true);
          });

        } catch (error: any) {
            console.error("Error fetching user/company data during auth state change:", error);
            setCurrentUser(user ? { ...user, adminProfile: undefined } : null); // Keep user if auth error wasn't fatal to user obj
            setCompanyProfile(null);
            setActivePlanId(LOWEST_TIER_PLAN_ID);
            setIsInitialDataLoaded(true); // Mark as loaded even on error to unblock UI
             if (error.code === 'permission-denied') {
                showToast("Permission Denied", "Failed to initialize user data. Check Firestore rules.", "destructive");
            }
        }
      } else {
        setCurrentUser(null);
        setCompanyId(null);
        // CompanyProfile, activePlanId, caches are already cleared at the top of the effect for any auth change.
        setIsInitialDataLoaded(true); // No user, so initial data (none) is considered loaded.
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // Removed fetchCompanyProfileData from deps as its definition is stable with useCallback and no external deps.
  // The other fetchAndCache functions are also stable due to useCallback.
  }, [fetchAndCacheStaff, fetchAndCacheTeams, fetchAndCacheAdmins, fetchAndCacheRoles]); 

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      companyId, 
      companyProfile, 
      activePlanId, 
      updateCompanyPlan, 
      fetchCompanyProfile: () => { if(companyId) fetchCompanyProfileData(companyId) },
      isInitialDataLoaded,
      staffListCache, fetchAndCacheStaff,
      teamsListCache, fetchAndCacheTeams,
      adminListCache, fetchAndCacheAdmins,
      rolesListCache, fetchAndCacheRoles,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    