import { Card } from "@/components/ui/card";
import { Lightbulb, Bike, Salad, Sun, Recycle, Home } from "lucide-react";
import { ActivityData } from "./ActivityForm";

interface TipsSectionProps {
  data: ActivityData;
  breakdown: {
    transport: number;
    meals: number;
    energy: number;
  };
}

const TipsSection = ({ data, breakdown }: TipsSectionProps) => {
  // Generate personalized tips based on user's data
  const generateTips = () => {
    const tips = [];

    // Transportation tips
    if (data.commuteType === "car" && data.commuteMiles > 5) {
      tips.push({
        icon: Bike,
        title: "Try Alternative Transport",
        description: `With ${data.commuteMiles} miles of car travel, consider carpooling, public transit, or biking for shorter trips to cut emissions by up to 50%.`,
        impact: "High",
      });
    }

    if (breakdown.transport > 8) {
      tips.push({
        icon: Home,
        title: "Work From Home",
        description: "If possible, work from home a few days a week to significantly reduce your commute emissions.",
        impact: "High",
      });
    }

    // Meal tips
    if (data.mealType === "meat-heavy") {
      tips.push({
        icon: Salad,
        title: "Try Meatless Mondays",
        description: "Reducing meat consumption by just one meal per week can save approximately 0.5 kg CO₂ per day.",
        impact: "Medium",
      });
    }

    if (data.mealType === "mixed") {
      tips.push({
        icon: Salad,
        title: "Go Plant-Based",
        description: "Plant-based meals can reduce food-related emissions by up to 50%. Try incorporating more vegetables and legumes.",
        impact: "Medium",
      });
    }

    // Energy tips
    if (data.electricityKwh > 25) {
      tips.push({
        icon: Sun,
        title: "Switch to LED Bulbs",
        description: "LED bulbs use 75% less energy and last 25 times longer than traditional bulbs.",
        impact: "Medium",
      });
    }

    if (breakdown.energy > 5) {
      tips.push({
        icon: Recycle,
        title: "Unplug Electronics",
        description: "Devices on standby mode can account for 10% of your energy use. Unplug chargers and appliances when not in use.",
        impact: "Low",
      });
    }

    // Always show renewable energy tip
    tips.push({
      icon: Sun,
      title: "Consider Renewable Energy",
      description: "Switching to a renewable energy provider can reduce your carbon footprint by up to 80%.",
      impact: "High",
    });

    return tips;
  };

  const tips = generateTips();

  const getImpactColor = (impact: string) => {
    if (impact === "High") return "text-secondary bg-secondary/10";
    if (impact === "Medium") return "text-accent bg-accent/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
            <Lightbulb className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Your Personalized Tips</h2>
          <p className="text-muted-foreground text-lg">
            Small changes that make a big difference
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <Card key={index} className="p-6 shadow-soft hover:shadow-strong transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{tip.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(tip.impact)}`}>
                      {tip.impact} Impact
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-6 bg-primary text-primary-foreground shadow-strong">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">Every Action Counts</h3>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto">
              Remember, reducing your carbon footprint is a journey. Start with one or two changes and gradually build sustainable habits. Together, we can make a difference! 🌍
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default TipsSection;