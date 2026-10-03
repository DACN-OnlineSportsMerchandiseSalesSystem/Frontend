import api from "./api";

export interface CalculatedMetrics {
  bmr: number;
  pal: number;
  tdee: number;
  targetCalories: number;
  calorieAdjustment: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  proteinRatioPercent: number;
  carbsRatioPercent: number;
  fatRatioPercent: number;
  formulaUsed: string;
}

export interface ValidationReport {
  calculatedMacroCalories: number;
  targetCalories: number;
  thermodynamicDiffPercent: number;
  isThermodynamicallyValid: boolean;
  weeklyVolumeSets: Record<string, number>;
  isVolumeOptimal: boolean;
  safetyNotes: string[];
  optimizationNotes: string[];
}

export interface ExerciseItem {
  name: string;
  target_muscle: string;
  sets: number;
  reps: string;
  rpe: number;
  rest_sec: number;
}

export interface WorkoutScheduleDay {
  day: string;
  focus: string;
  exercises: ExerciseItem[];
}

export interface WorkoutPlanData {
  split_name: string;
  days_per_week: number;
  schedule: WorkoutScheduleDay[];
}

export interface MealItemDetail {
  name: string;
  amount: string;
  calories: number;
}

export interface MealDetail {
  meal_type: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  items: MealItemDetail[];
}

export interface MealPlanData {
  daily_summary: {
    total_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  meals: MealDetail[];
}

/**
 * HẠNG MỤC 1: Tham chiếu khoa học y tế & thể thao (ACSM, ISSN, WHO, Mifflin-St Jeor)
 */
export interface ScientificReference {
  domain: string;
  principle: string;
  source: string;
  year: string;
  citation: string;
  applicationInPlan?: string;
  application_in_plan?: string;
}

export interface AiPlannerResponse {
  metrics: CalculatedMetrics;
  workoutPlan: WorkoutPlanData;
  mealPlan: MealPlanData;
  validationReport: ValidationReport;
  planTitle: string;
  savedPlanId?: number;
  version: number;
  scientificReferences?: ScientificReference[];
  legalDisclaimer?: string;
}

export interface AiPlannerRequest {
  height?: number;
  weight?: number;
  age?: number;
  gender?: "male" | "female";
  activityLevel?: string;
  goal?: string;
  location?: string;
  injuries?: string;
  dietaryPreferences?: string;
  daysPerWeek?: number;
  customNotes?: string;
}

export interface AiPlanSnapshotEntity {
  id: number;
  title: string;
  planType: string;
  version: number;
  isActive: boolean;
  planJson: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  createdAt: string;
  updatedAt: string;
}

export const aiPlannerService = {
  // Module 1-4: Generate 6-module plan
  generatePlan: async (request: AiPlannerRequest): Promise<AiPlannerResponse> => {
    const response = await api.post<AiPlannerResponse>("/ai-planner/generate", request);
    return response.data;
  },

  // Module 5: Differential delta update
  refinePlan: async (
    refinementPrompt: string,
    currentData: AiPlannerResponse,
    targetType: "workout" | "meal" | "both" = "both"
  ): Promise<AiPlannerResponse> => {
    const payload = {
      metrics: currentData.metrics,
      currentWorkoutPlan: currentData.workoutPlan,
      currentMealPlan: currentData.mealPlan,
      refinementPrompt,
      targetType,
    };
    const response = await api.post<AiPlannerResponse>("/ai-planner/refine", payload);
    return response.data;
  },

  // Module 6: Persistence
  savePlan: async (title: string, planType: string, planData: AiPlannerResponse): Promise<AiPlanSnapshotEntity> => {
    const response = await api.post<AiPlanSnapshotEntity>("/ai-planner/save", {
      title,
      planType,
      planData,
    });
    return response.data;
  },

  getSavedPlans: async (): Promise<AiPlanSnapshotEntity[]> => {
    const response = await api.get<AiPlanSnapshotEntity[]>("/ai-planner/saved");
    return response.data;
  },

  getPlanById: async (id: number): Promise<AiPlanSnapshotEntity> => {
    const response = await api.get<AiPlanSnapshotEntity>(`/ai-planner/saved/${id}`);
    return response.data;
  },

  setActivePlan: async (id: number): Promise<void> => {
    await api.put(`/ai-planner/saved/${id}/active`);
  },

  deletePlan: async (id: number): Promise<void> => {
    await api.delete(`/ai-planner/saved/${id}`);
  },

  exportIcsUrl: (id: number): string => {
    return `${api.defaults.baseURL || "http://localhost:8080/api"}/ai-planner/export/ics/${id}`;
  },
};

export default aiPlannerService;
