
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import type { PlanId } from '@/lib/app-types';

const DEFAULT_FALLBACK_PLAN_ID: PlanId = 'growth';

export function useCurrentPlan() {
  const { activePlanId: planFromAuth, updateCompanyPlan, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlanState] = useState<PlanId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setCurrentPlanState(planFromAuth || DEFAULT_FALLBACK_PLAN_ID);
      setIsLoading(false);
    }
  }, [authLoading, planFromAuth]);

  const setCurrentPlan = useCallback(async (planId: PlanId) => {
    try {
      await updateCompanyPlan(planId);
      setCurrentPlanState(planId); // Local state updates on successful Firestore update (handled in AuthContext)
    } catch (error) {
      console.error("Error setting current plan (via useCurrentPlan -> updateCompanyPlan):", error);
      // Optionally, surface this error to the user via toast
    }
  }, [updateCompanyPlan]);

  return { currentPlan, setCurrentPlan, isLoading };
}
