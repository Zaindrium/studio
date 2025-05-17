
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { AdminUser } from '@/lib/app-types'; // Using AdminUser for more specific typing

interface AuthContextType {
  currentUser: (FirebaseUser & { companyId?: string; adminProfile?: AdminUser }) | null;
  loading: boolean;
  companyId: string | null; // Explicitly add companyId here
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<(FirebaseUser & { companyId?: string; adminProfile?: AdminUser }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // In our simplified model, the user's UID is their adminId AND companyId.
        // Fetch admin profile to get companyId if it were stored differently
        // For now, we'll assume user.uid is the companyId.
        const adminUserRef = doc(db, `companies/${user.uid}/admins/${user.uid}`);
        const adminDocSnap = await getDoc(adminUserRef);
        let fetchedAdminProfile: AdminUser | undefined;
        let fetchedCompanyId: string | undefined = user.uid; // Default to user.uid as companyId

        if (adminDocSnap.exists()) {
          fetchedAdminProfile = adminDocSnap.data() as AdminUser;
          if (fetchedAdminProfile.companyId) {
             fetchedCompanyId = fetchedAdminProfile.companyId;
          }
        } else {
          // This case might happen if signup didn't complete or user doc was deleted.
          // For now, we stick with user.uid as companyId if adminProfile is not found.
          console.warn(`Admin profile not found for UID: ${user.uid}. Using UID as companyId.`);
        }
        
        setCurrentUser({ ...user, companyId: fetchedCompanyId, adminProfile: fetchedAdminProfile });
        setCompanyId(fetchedCompanyId);
      } else {
        setCurrentUser(null);
        setCompanyId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, companyId }}>
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
