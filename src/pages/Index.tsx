import { useState } from "react";
import Hero from "@/components/Hero";
import ActivityForm from "@/components/ActivityForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import TipsSection from "@/components/TipsSection";
import { ActivityData } from "@/components/ActivityForm";
import { calculateCarbonFootprint } from "@/utils/carbonCalculations";

type ViewState = "hero" | "form" | "results";

const Index = () => {
  const [view, setView] = useState<ViewState>("hero");
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [carbonResults, setCarbonResults] = useState<any>(null);

  const handleGetStarted = () => {
    setView("form");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCalculate = (data: ActivityData) => {
    setActivityData(data);
    const results = calculateCarbonFootprint(data);
    setCarbonResults(results);
    setView("results");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setView("hero");
    setActivityData(null);
    setCarbonResults(null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen">
      {view === "hero" && <Hero onGetStarted={handleGetStarted} />}
      
      {view === "form" && <ActivityForm onCalculate={handleCalculate} />}
      
      {view === "results" && activityData && carbonResults && (
        <>
          <ResultsDashboard
            data={activityData}
            co2Total={carbonResults.total}
            breakdown={{
              transport: carbonResults.transport,
              meals: carbonResults.meals,
              energy: carbonResults.energy,
            }}
            onReset={handleReset}
          />
          <TipsSection
            data={activityData}
            breakdown={{
              transport: carbonResults.transport,
              meals: carbonResults.meals,
              energy: carbonResults.energy,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Index;