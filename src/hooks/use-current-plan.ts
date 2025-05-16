
"use client";

import { useState, useEffect, useCallback } from 'react';

export type PlanId = 'free' | 'starter' | 'growth' | 'enterprise';
const LOCAL_STORAGE_KEY = 'linkup_current_plan_id';
const DEFAULT_PLAN_ID: PlanId = 'growth'; // Default plan if nothing is set

export function useCurrentPlan() {
  const [currentPlan, setCurrentPlanState] = useState<PlanId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem(LOCAL_STORAGE_KEY) as PlanId | null;
      if (storedPlan && ['free', 'starter', 'growth', 'enterprise'].includes(storedPlan)) {
        setCurrentPlanState(storedPlan);
      } else {
        setCurrentPlanState(DEFAULT_PLAN_ID);
        // Optionally set the default in localStorage if it wasn't there
        // localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_PLAN_ID);
      }
    } catch (error) {
      console.error("Error accessing localStorage for current plan:", error);
      setCurrentPlanState(DEFAULT_PLAN_ID); // Fallback to default on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentPlan = useCallback((planId: PlanId) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, planId);
      setCurrentPlanState(planId);
    } catch (error) {
      console.error("Error setting current plan in localStorage:", error);
    }
  }, []);

  return { currentPlan, setCurrentPlan, isLoading };
}
