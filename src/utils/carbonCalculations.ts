import { ActivityData } from "@/components/ActivityForm";

// CO2 emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.411, // kg CO2 per mile (gasoline car)
    "electric-car": 0.148, // kg CO2 per mile (electric car, grid average)
    bus: 0.089, // kg CO2 per mile
    train: 0.041, // kg CO2 per mile
    bike: 0, // zero emissions
  },
  meals: {
    "meat-heavy": 7.2, // kg CO2 per meal (beef-heavy)
    mixed: 5.5, // kg CO2 per meal (average)
    vegetarian: 3.8, // kg CO2 per meal
    vegan: 2.9, // kg CO2 per meal
  },
  electricity: 0.385, // kg CO2 per kWh (US average grid mix)
};

export interface CarbonBreakdown {
  transport: number;
  meals: number;
  energy: number;
  total: number;
}

export const calculateCarbonFootprint = (data: ActivityData): CarbonBreakdown => {
  // Calculate transport emissions
  const transportFactor = EMISSION_FACTORS.transport[data.commuteType as keyof typeof EMISSION_FACTORS.transport] || 0;
  const transportEmissions = data.commuteMiles * transportFactor;

  // Calculate meal emissions
  const mealFactor = EMISSION_FACTORS.meals[data.mealType as keyof typeof EMISSION_FACTORS.meals] || 0;
  const mealEmissions = data.mealCount * mealFactor;

  // Calculate energy emissions
  const energyEmissions = data.electricityKwh * EMISSION_FACTORS.electricity;

  const total = transportEmissions + mealEmissions + energyEmissions;

  return {
    transport: transportEmissions,
    meals: mealEmissions,
    energy: energyEmissions,
    total,
  };
};