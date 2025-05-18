
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { AdminUser, CompanyProfile, PlanId } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types'; // Import APP_PLANS for default

const DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY: PlanId = APP_PLANS.find(p => p.id === 'growth')?.id || 'growth';

interface AuthContextType {
  currentUser: (FirebaseUser & { adminProfile?: AdminUser }) | null; // Removed companyId from here as it's part of adminProfile
  loading: boolean;
  companyId: string | null; // Keep companyId separate for direct access
  companyProfile: CompanyProfile | null; // Add companyProfile
  activePlanId: PlanId | null;
  updateCompanyPlan: (planId: PlanId) => Promise<void>;
  fetchCompanyProfile: () => Promise<void>; // To allow manual refresh
  isInitialDataLoaded: boolean; // Flag for initial dashboard data load
  staffListCache: StaffRecord[] | null;
  teamsListCache: Team[] | null;
  adminListCache: AdminUser[] | null;
  rolesListCache: Role[] | null;
  fetchAndCacheStaff: (companyId: string) => Promise<void>;
  fetchAndCacheTeams: (companyId: string) => Promise<void>;
  fetchAndCacheAdmins: (companyId: string) => Promise<void>;
  fetchAndCacheRoles: (companyId: string) => Promise<void>;
}

// Forward declarations for types used in this file but defined elsewhere or later
interface StaffRecord { id: string; /* ... other fields ... */ }
interface Team { id: string; /* ... other fields ... */ }
interface Role { id: string; /* ... other fields ... */ }


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
        setActivePlanId(companyData.activePlanId || DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY);
      } else {
        console.warn(`Company profile not found for ID: ${cid}. Setting default plan.`);
        setCompanyProfile(null); // Or a default shape
        setActivePlanId(DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      setCompanyProfile(null);
      setActivePlanId(DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY);
    }
  }, []);

  const updateCompanyPlan = useCallback(async (planId: PlanId) => {
    if (companyId) {
      try {
        const companyRef = doc(db, "companies", companyId);
        await updateDoc(companyRef, { activePlanId: planId, updatedAt: serverTimestamp() });
        setActivePlanId(planId); // Update local context state immediately
        if (companyProfile) { // Update local companyProfile as well
            setCompanyProfile(prev => prev ? { ...prev, activePlanId: planId } : null);
        }
      } catch (error) {
        console.error("Error updating company plan in Firestore:", error);
        throw error;
      }
    } else {
      console.error("Cannot update plan: companyId not available.");
      throw new Error("Company ID not available to update plan.");
    }
  }, [companyId, companyProfile]);


  const fetchAndCacheStaff = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      const staffCollectionRef = collection(db, `companies/${cid}/staff`);
      const q = query(staffCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedStaff: StaffRecord[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as StaffRecord));
      setStaffListCache(fetchedStaff);
    } catch (error: any) {
      console.error("Error fetching staff for cache:", error);
      setStaffListCache([]);
       if (error.code === 'permission-denied') {
        // Optionally toast here or let individual pages handle it
      }
    }
  }, []);

  const fetchAndCacheTeams = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      const teamsCollectionRef = collection(db, `companies/${cid}/teams`);
      const q = query(teamsCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedTeams: Team[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Team));
      setTeamsListCache(fetchedTeams);
    } catch (error: any) {
      console.error("Error fetching teams for cache:", error);
      setTeamsListCache([]);
      if (error.code === 'permission-denied') {
        // Optionally toast here
      }
    }
  }, []);
  
  const fetchAndCacheAdmins = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      const adminsCollectionRef = collection(db, `companies/${cid}/admins`);
      const q = query(adminsCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedAdmins: AdminUser[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as AdminUser));
      setAdminListCache(fetchedAdmins);
    } catch (error: any) {
      console.error("Error fetching admins for cache:", error);
      setAdminListCache([]);
      if (error.code === 'permission-denied') {
        // Optionally toast here
      }
    }
  }, []);

  const fetchAndCacheRoles = useCallback(async (cid: string) => {
    if (!cid) return;
    console.log("Fetching roles for cache (companyId:", cid, ")"); // Placeholder logging
    // Assuming roles are stored under companies/{companyId}/roles
    try {
      const rolesCollectionRef = collection(db, `companies/${cid}/roles`);
      const q = query(rolesCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedRoles: Role[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Role));
      setRolesListCache(fetchedRoles);
    } catch (error: any) {
      console.error("Error fetching roles for cache:", error);
      setRolesListCache([]);
       if (error.code === 'permission-denied') {
        // Optionally toast here
      }
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setIsInitialDataLoaded(false); // Reset on auth change
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
            const newAdminProfile: AdminUser = {
              id: user.uid,
              companyId: currentCompanyId,
              companyName: user.displayName ? `${user.displayName}'s Company` : `Company ${currentCompanyId.substring(0,6)}`,
              name: user.displayName || user.email || "Admin",
              email: user.email || "",
              emailVerified: user.emailVerified,
              role: 'Owner',
              status: 'Active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(adminUserRef, newAdminProfile);
            fetchedAdminProfile = newAdminProfile;
            console.warn(`Admin profile for ${user.uid} not found, created a default one.`);
          }
          
          await fetchCompanyProfileData(currentCompanyId); // This sets companyProfile and activePlanId
          setCurrentUser({ ...user, adminProfile: fetchedAdminProfile });

          // Initial data prefetch
          Promise.all([
            fetchAndCacheStaff(currentCompanyId),
            fetchAndCacheTeams(currentCompanyId),
            fetchAndCacheAdmins(currentCompanyId),
            fetchAndCacheRoles(currentCompanyId),
          ]).catch(cacheError => {
            // Catch errors from prefetching so they don't stop other logic
            console.error("Error during initial data prefetch:", cacheError);
          }).finally(() => {
            setIsInitialDataLoaded(true);
          });

        } catch (error) {
            console.error("Error fetching user/company data during auth state change:", error);
            setCurrentUser({ ...user, adminProfile: undefined });
            setCompanyProfile(null);
            setActivePlanId(DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY);
            setIsInitialDataLoaded(true); 
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
