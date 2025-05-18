
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { AdminUser, CompanyProfile, PlanId, StaffRecord, Team, Role } from '@/lib/app-types'; // Added Role
import { APP_PLANS } from '@/lib/app-types';

const DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY: PlanId = APP_PLANS.find(p => p.id === 'growth')?.id || 'growth';
const LOWEST_TIER_PLAN_ID: PlanId = APP_PLANS.find(p => p.id === 'free')?.id || 'free';

interface AuthContextType {
  currentUser: (FirebaseUser & { adminProfile?: AdminUser }) | null;
  loading: boolean;
  companyId: string | null;
  companyProfile: CompanyProfile | null;
  activePlanId: PlanId | null;
  updateCompanyPlan: (planId: PlanId) => Promise<void>;
  fetchCompanyProfile: () => Promise<void>;
  isInitialDataLoaded: boolean;
  staffListCache: StaffRecord[] | null;
  teamsListCache: Team[] | null;
  adminListCache: AdminUser[] | null;
  rolesListCache: Role[] | null;
  fetchAndCacheStaff: (companyId: string) => Promise<void>;
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

  // Generic toast import - assuming useToast is available globally or passed down
  // For simplicity, direct import for now, though ideally through a provider or prop
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    // Placeholder: in a real app, you'd call your global toast function here
    console.log(`Toast: ${title} - ${description} (${variant})`);
     if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast({ title, description, variant });
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
        setActivePlanId(companyData.activePlanId || LOWEST_TIER_PLAN_ID); // Default to free if not set
      } else {
        console.warn(`Company profile not found for ID: ${cid}. This might indicate an incomplete setup.`);
        setCompanyProfile(null);
        setActivePlanId(LOWEST_TIER_PLAN_ID); // Default to free if company profile is missing
      }
    } catch (error: any) {
      console.error("Error fetching company profile:", error);
      setCompanyProfile(null);
      setActivePlanId(LOWEST_TIER_PLAN_ID); // Default to free on error
      if (error.code === 'permission-denied') {
        showToast("Permission Denied", "Failed to fetch company profile. Check Firestore rules.", "destructive");
      } else {
        showToast("Error", `Failed to fetch company profile: ${error.message || 'Unknown error'}.`, "destructive");
      }
    }
  }, [LOWEST_TIER_PLAN_ID]);

  const updateCompanyPlan = useCallback(async (planId: PlanId) => {
    if (companyId) {
      try {
        const companyRef = doc(db, "companies", companyId);
        await updateDoc(companyRef, { activePlanId: planId, updatedAt: serverTimestamp() });
        setActivePlanId(planId);
        setCompanyProfile(prev => prev ? { ...prev, activePlanId: planId, updatedAt: new Timestamp(Date.now()/1000, 0) } : null);
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
    cacheName: string
  ) => {
    return useCallback(async (cid: string) => {
      if (!cid) {
        setter(null); // Clear cache if no companyId
        return;
      }
      try {
        const collectionRef = collection(db, `companies/${cid}/${collectionName}`);
        const q = query(collectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedItems: T[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as T));
        setter(fetchedItems);
      } catch (error: any) {
        console.error(`Error fetching ${cacheName} for cache:`, error);
        setter([]); // Set to empty array on error to indicate fetch attempt was made
        if (error.code === 'permission-denied') {
            showToast("Permission Denied", `Could not fetch ${cacheName}. Check Firestore rules.`, "destructive");
        }
      }
    }, [setter, collectionName, cacheName]);
  };

  const fetchAndCacheStaff = fetchAndCacheFactory<StaffRecord>("staff", setStaffListCache, "staff list");
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
            const newAdminProfileData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'> = {
              companyId: currentCompanyId,
              companyName: user.displayName ? `${user.displayName}'s Company` : `Company ${currentCompanyId.substring(0,6)}`,
              name: user.displayName || user.email || "Admin",
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
            // To avoid race condition with serverTimestamp, fetch what was written or construct locally
            fetchedAdminProfile = {
                id: user.uid,
                ...newAdminProfileData,
                createdAt: new Date().toISOString(), // Use current time as approximation
                updatedAt: new Date().toISOString(),
            };
            console.warn(`Admin profile for ${user.uid} not found, created a default one.`);
          }
          
          setCurrentUser({ ...user, adminProfile: fetchedAdminProfile });
          await fetchCompanyProfileData(currentCompanyId);

          Promise.all([
            fetchAndCacheStaff(currentCompanyId),
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
  }, [fetchCompanyProfileData, fetchAndCacheStaff, fetchAndCacheTeams, fetchAndCacheAdmins, fetchAndCacheRoles, LOWEST_TIER_PLAN_ID]);

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
