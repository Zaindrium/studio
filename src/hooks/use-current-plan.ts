
"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import type { PlanId } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types'; // Import APP_PLANS to find a default

const DEFAULT_FALLBACK_PLAN_ID: PlanId = APP_PLANS.find(p => p.id === 'growth' && p.isBusiness)?.id || APP_PLANS.find(p => p.isBusiness)?.id || APP_PLANS[0]?.id || 'growth';


export function useCurrentPlan() {
  const { 
    activePlanId: planFromAuth, 
    updateCompanyPlan, 
    loading: authLoading,
    companyProfile // Get companyProfile to ensure initial plan is read
  } = useAuth();

  // isLoading is true if auth is loading OR if companyProfile hasn't been fetched yet (which contains the initial plan)
  const isLoading = authLoading || !companyProfile;

  // The current plan is directly from the AuthContext, or the default if still loading/null
  const currentPlan = isLoading ? null : (planFromAuth || DEFAULT_FALLBACK_PLAN_ID);
  
  const setCurrentPlanInFirestore = useCallback(async (planId: PlanId) => {
    try {
      await updateCompanyPlan(planId);
      // No local state to set here; AuthContext will update and trigger re-renders
    } catch (error) {
      console.error("Error setting current plan (via useCurrentPlan -> updateCompanyPlan):", error);
      // Optionally, surface this error to the user via toast
      throw error; // Re-throw so the calling component knows about the error
    }
  }, [updateCompanyPlan]);

  return { 
    currentPlan, // This is now directly from AuthContext or default
    setCurrentPlan: setCurrentPlanInFirestore, 
    isLoading 
  };
}
