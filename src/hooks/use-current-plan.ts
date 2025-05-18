
"use client";

import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { PlanId } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types';

const DEFAULT_FALLBACK_PLAN_ID: PlanId = APP_PLANS.find(p => p.id === 'free')?.id || 'free'; // Changed to 'free'

export function useCurrentPlan() {
  const { 
    activePlanId: planFromAuthContext,
    updateCompanyPlan, 
    loading: authIsLoading,
    companyProfile // Used to determine if initial plan data is loaded
  } = useAuth();

  // isLoading is true if auth is still resolving OR if the company profile (which sets the initial plan) hasn't loaded yet.
  const isLoading = authIsLoading || !companyProfile;

  // If not loading, use planFromAuthContext. If that's null (e.g., new company before any plan set, or profile missing), then default to free.
  const currentPlan = isLoading ? null : (planFromAuthContext || DEFAULT_FALLBACK_PLAN_ID);
  
  const setCurrentPlanInFirestore = useCallback(async (planId: PlanId) => {
    try {
      await updateCompanyPlan(planId);
    } catch (error) {
      console.error("Error setting current plan (via useCurrentPlan -> updateCompanyPlan):", error);
      // Error should be handled by updateCompanyPlan, which shows a toast
      throw error; 
    }
  }, [updateCompanyPlan]);

  return { 
    currentPlan, 
    setCurrentPlan: setCurrentPlanInFirestore, 
    isLoading 
  };
}
