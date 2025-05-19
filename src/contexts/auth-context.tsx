
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp, collection, query, getDocs, limit, orderBy, startAfter, DocumentSnapshot, endBefore, limitToLast } from 'firebase/firestore';
import type { AdminUser, CompanyProfile, PlanId, StaffRecord, Team, Role } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types';

const DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY: PlanId = APP_PLANS.find(p => p.id === 'growth')?.id || 'growth';
const LOWEST_TIER_PLAN_ID: PlanId = APP_PLANS.find(p => p.id === 'free')?.id || 'free';
const INITIAL_FETCH_LIMIT = 10; // For initial caching in AuthContext

interface AuthContextType {
  currentUser: (FirebaseUser & { adminProfile?: AdminUser }) | null;
  loading: boolean;
  companyId: string | null;
  companyProfile: CompanyProfile | null;
  activePlanId: PlanId | null;
  updateCompanyPlan: (planId: PlanId) => Promise<void>;
  fetchCompanyProfile: () => Promise<void>;
  isInitialDataLoaded: boolean; // Indicates if initial auth-dependent data (company, basic lists) has been fetched
  staffListCache: StaffRecord[] | null; // Will store only the first page or be a signal
  teamsListCache: Team[] | null;
  adminListCache: AdminUser[] | null;
  rolesListCache: Role[] | null;
  fetchAndCacheStaff: (companyId: string, lastDoc?: DocumentSnapshot) => Promise<{newStaffList: StaffRecord[], newLastDoc?: DocumentSnapshot}>; // Modified for pagination support
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
        console.warn(`Company profile not found for ID: ${cid}.`);
        setCompanyProfile(null);
        setActivePlanId(LOWEST_TIER_PLAN_ID);
      }
    } catch (error: any) {
      console.error("Error fetching company profile:", error);
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
        setCompanyProfile(prev => prev ? { ...prev, activePlanId: planId, updatedAt: serverTimestamp() } : null);
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
    shouldPaginate: boolean = false // New parameter
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
            q = query(collectionRef, orderBy("name"), limit(INITIAL_FETCH_LIMIT)); // Example: order by name for staff
            if (lastDoc) {
                q = query(collectionRef, orderBy("name"), startAfter(lastDoc), limit(INITIAL_FETCH_LIMIT));
            }
        } else {
            q = query(collectionRef, orderBy("name")); // Default: order by name
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedItems: T[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as T));
        
        if (shouldPaginate) {
            // For paginated cache in AuthContext, we only store the first page
            // Or simply indicate that data might exist but let the page handle full pagination
            setter(fetchedItems.length > 0 ? fetchedItems : []); // Store first page or empty if nothing found
            return { newList: fetchedItems, newLastDoc: querySnapshot.docs[querySnapshot.docs.length -1] };
        } else {
            setter(fetchedItems);
            return { newList: fetchedItems, newLastDoc: undefined };
        }

      } catch (error: any) {
        console.error(`Error fetching ${cacheName} for cache:`, error);
        setter([]); 
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
      if (user) {
        const currentCompanyId = user.uid; 
        setCompanyId(currentCompanyId);
        
        let fetchedAdminProfile: AdminUser | undefined;
        try {
          const adminUserRef = doc(db, `companies/${currentCompanyId}/admins/${user.uid}`);
          const adminDocSnap = await getDoc(adminUserRef);
          if (adminDocSnap.exists()) {
            fetchedAdminProfile = adminDocSnap.data() as AdminUser;
          } else {
             const defaultAdminName = user.displayName || user.email?.split('@')[0] || 'Admin';
             const defaultCompanyName = `${defaultAdminName}'s Company`;
            const newAdminProfileData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'> = {
              companyId: currentCompanyId,
              companyName: defaultCompanyName,
              name: defaultAdminName,
              email: user.email || "",
              emailVerified: user.emailVerified,
              role: 'Owner',
              status: 'Active',
            };
            await setDoc(adminUserRef, {
              ...newAdminProfileData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            fetchedAdminProfile = {
                id: user.uid,
                ...newAdminProfileData,
                createdAt: serverTimestamp(), 
                updatedAt: serverTimestamp(),
            };
          }
          
          setCurrentUser({ ...user, adminProfile: fetchedAdminProfile });
          await fetchCompanyProfileData(currentCompanyId);

          // Prefetch initial data for dashboard lists
          Promise.all([
            fetchAndCacheStaff(currentCompanyId), // Fetches first page for staff
            fetchAndCacheTeams(currentCompanyId),
            fetchAndCacheAdmins(currentCompanyId),
            fetchAndCacheRoles(currentCompanyId),
          ]).catch(cacheError => {
            console.error("Error during initial data prefetch:", cacheError);
          }).finally(() => {
            setIsInitialDataLoaded(true);
          });

        } catch (error: any) {
            console.error("Error fetching user/company data during auth state change:", error);
            setCurrentUser({ ...user, adminProfile: undefined });
            setCompanyProfile(null);
            setActivePlanId(LOWEST_TIER_PLAN_ID);
            setIsInitialDataLoaded(true);
             if (error.code === 'permission-denied') {
                showToast("Permission Denied", "Failed to initialize user data. Check Firestore rules.", "destructive");
            }
        }
      } else {
        setCurrentUser(null);
        setCompanyId(null);
        setCompanyProfile(null);
        setActivePlanId(null);
        setStaffListCache(null);
        setTeamsListCache(null);
        setAdminListCache(null);
        setRolesListCache(null);
        setIsInitialDataLoaded(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchCompanyProfileData, fetchAndCacheStaff, fetchAndCacheTeams, fetchAndCacheAdmins, fetchAndCacheRoles]);

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

    