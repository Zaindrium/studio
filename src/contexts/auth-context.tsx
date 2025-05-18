
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { AdminUser, CompanyProfile, PlanId } from '@/lib/app-types';

interface AuthContextType {
  currentUser: (FirebaseUser & { companyId?: string; adminProfile?: AdminUser }) | null;
  loading: boolean;
  companyId: string | null;
  activePlanId: PlanId | null;
  updateCompanyPlan: (planId: PlanId) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<(FirebaseUser & { companyId?: string; adminProfile?: AdminUser }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<PlanId | null>(null);

  const updateCompanyPlan = useCallback(async (planId: PlanId) => {
    if (companyId) {
      try {
        const companyRef = doc(db, "companies", companyId);
        await updateDoc(companyRef, { activePlanId: planId });
        setActivePlanId(planId); // Update local context state
      } catch (error) {
        console.error("Error updating company plan in Firestore:", error);
        // Optionally, throw the error or handle it with a toast
        throw error;
      }
    } else {
      console.error("Cannot update plan: companyId not available.");
      throw new Error("Company ID not available to update plan.");
    }
  }, [companyId]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentCompanyId = user.uid; // Assuming admin UID is company ID
        setCompanyId(currentCompanyId);
        
        let fetchedAdminProfile: AdminUser | undefined;
        let fetchedPlanId: PlanId | null = null;

        try {
          // Fetch Admin Profile
          const adminUserRef = doc(db, `companies/${currentCompanyId}/admins/${user.uid}`);
          const adminDocSnap = await getDoc(adminUserRef);
          if (adminDocSnap.exists()) {
            fetchedAdminProfile = adminDocSnap.data() as AdminUser;
          } else {
            console.warn(`Admin profile not found for UID: ${user.uid}.`);
          }

          // Fetch Company Profile (which includes activePlanId)
          const companyRef = doc(db, "companies", currentCompanyId);
          const companyDocSnap = await getDoc(companyRef);
          if (companyDocSnap.exists()) {
            const companyData = companyDocSnap.data() as CompanyProfile;
            fetchedPlanId = companyData.activePlanId || null;
          } else {
            console.warn(`Company profile not found for ID: ${currentCompanyId}.`);
          }
        } catch (error) {
            console.error("Error fetching user/company data during auth state change:", error);
        }
        
        setCurrentUser({ ...user, companyId: currentCompanyId, adminProfile: fetchedAdminProfile });
        setActivePlanId(fetchedPlanId);

      } else {
        setCurrentUser(null);
        setCompanyId(null);
        setActivePlanId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, companyId, activePlanId, updateCompanyPlan }}>
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
