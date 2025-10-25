import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Utensils, Zap, ArrowRight } from "lucide-react";

export interface ActivityData {
  commuteMiles: number;
  commuteType: string;
  mealType: string;
  mealCount: number;
  electricityKwh: number;
}

interface ActivityFormProps {
  onCalculate: (data: ActivityData) => void;
}

const ActivityForm = ({ onCalculate }: ActivityFormProps) => {
  const [formData, setFormData] = useState<ActivityData>({
    commuteMiles: 0,
    commuteType: "car",
    mealType: "mixed",
    mealCount: 3,
    electricityKwh: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <section className="min-h-screen py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Track Your Daily Activities</h2>
          <p className="text-muted-foreground text-lg">
            Enter your daily activities to calculate your carbon footprint
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Transportation Card */}
            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Transportation</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="commuteType">Mode of Transport</Label>
                  <Select
                    value={formData.commuteType}
                    onValueChange={(value) => setFormData({ ...formData, commuteType: value })}
                  >
                    <SelectTrigger id="commuteType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car (Gasoline)</SelectItem>
                      <SelectItem value="electric-car">Electric Car</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bike">Bike/Walk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="commuteMiles">Distance (miles)</Label>
                  <Input
                    id="commuteMiles"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.commuteMiles}
                    onChange={(e) => setFormData({ ...formData, commuteMiles: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 15.5"
                  />
                </div>
              </div>
            </Card>

            {/* Meals Card */}
            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Utensils className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Meals</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mealType">Diet Type</Label>
                  <Select
                    value={formData.mealType}
                    onValueChange={(value) => setFormData({ ...formData, mealType: value })}
                  >
                    <SelectTrigger id="mealType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meat-heavy">Meat Heavy</SelectItem>
                      <SelectItem value="mixed">Mixed Diet</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="mealCount">Number of Meals</Label>
                  <Input
                    id="mealCount"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.mealCount}
                    onChange={(e) => setFormData({ ...formData, mealCount: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            </Card>

            {/* Energy Card */}
            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Energy Usage</h3>
              </div>
              
              <div>
                <Label htmlFor="electricityKwh">Electricity Used (kWh)</Label>
                <Input
                  id="electricityKwh"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.electricityKwh}
                  onChange={(e) => setFormData({ ...formData, electricityKwh: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 8.5"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Average household uses ~30 kWh per day
                </p>
              </div>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
            >
              Calculate My Footprint
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ActivityForm;