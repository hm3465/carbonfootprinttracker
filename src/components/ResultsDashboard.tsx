import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingUp, AlertCircle, Car, Utensils, Zap, RotateCcw } from "lucide-react";
import { ActivityData } from "./ActivityForm";

interface ResultsDashboardProps {
  data: ActivityData;
  co2Total: number;
  breakdown: {
    transport: number;
    meals: number;
    energy: number;
  };
  onReset: () => void;
}

const ResultsDashboard = ({ data, co2Total, breakdown, onReset }: ResultsDashboardProps) => {
  const getImpactLevel = (kg: number) => {
    if (kg < 10) return { text: "Low Impact", color: "text-secondary", bg: "bg-secondary/10" };
    if (kg < 20) return { text: "Moderate Impact", color: "text-warning-amber", bg: "bg-warning-amber/10" };
    return { text: "High Impact", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const impact = getImpactLevel(co2Total);
  const percentage = (category: number) => ((category / co2Total) * 100).toFixed(1);

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Your Carbon Footprint</h2>
          <p className="text-muted-foreground text-lg">
            Based on your daily activities
          </p>
        </div>

        {/* Main Result Card */}
        <Card className={`p-8 mb-8 shadow-strong ${impact.bg} border-2`}>
          <div className="text-center">
            <div className="mb-4">
              <span className={`text-6xl font-bold ${impact.color}`}>
                {co2Total.toFixed(1)}
              </span>
              <span className="text-2xl ml-2 text-muted-foreground">kg CO₂</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${impact.bg}`}>
              <AlertCircle className={`w-5 h-5 ${impact.color}`} />
              <span className={`font-semibold ${impact.color}`}>{impact.text}</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              emitted today from your tracked activities
            </p>
          </div>
        </Card>

        {/* Breakdown Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Transportation</h3>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {breakdown.transport.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage(breakdown.transport)}% of total
            </div>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{data.commuteMiles} miles by {data.commuteType}</span>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Utensils className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Meals</h3>
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {breakdown.meals.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage(breakdown.meals)}% of total
            </div>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{data.mealCount} {data.mealType} meals</span>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold">Energy</h3>
            </div>
            <div className="text-3xl font-bold text-secondary mb-2">
              {breakdown.energy.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage(breakdown.energy)}% of total
            </div>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{data.electricityKwh} kWh used</span>
            </div>
          </Card>
        </div>

        {/* Context Card */}
        <Card className="p-6 mb-8 shadow-soft bg-muted/50">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Put It In Perspective</h3>
              <p className="text-muted-foreground text-sm">
                The average American produces about <strong>16 kg of CO₂ per day</strong>. 
                {co2Total < 16 
                  ? " You're doing better than average! Keep it up." 
                  : " There's room for improvement. Check out the tips below to reduce your impact."}
              </p>
            </div>
          </div>
        </Card>

        {/* Reset Button */}
        <div className="text-center">
          <Button 
            onClick={onReset}
            variant="outline"
            size="lg"
            className="shadow-soft"
          >
            <RotateCcw className="mr-2 w-5 h-5" />
            Calculate Again
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResultsDashboard;