import { Button } from "@/components/ui/button";
import { Leaf, TrendingDown, Target } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-light to-accent">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl border border-primary-foreground/20">
              <Leaf className="w-12 h-12" />
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Track Your Carbon
            <span className="block bg-gradient-to-r from-accent to-primary-foreground bg-clip-text text-transparent">
              Footprint
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-12 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Understand your environmental impact and discover simple ways to live more sustainably
          </p>
          
          {/* CTA Button */}
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Calculate Your Footprint
          </Button>
          
          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-primary-foreground/10 backdrop-blur-sm p-6 rounded-2xl border border-primary-foreground/20">
              <Target className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Track Daily</h3>
              <p className="text-sm text-primary-foreground/80">
                Monitor your transport, meals, and energy use
              </p>
            </div>
            
            <div className="bg-primary-foreground/10 backdrop-blur-sm p-6 rounded-2xl border border-primary-foreground/20">
              <TrendingDown className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Get Insights</h3>
              <p className="text-sm text-primary-foreground/80">
                See your CO₂ impact in real-time
              </p>
            </div>
            
            <div className="bg-primary-foreground/10 backdrop-blur-sm p-6 rounded-2xl border border-primary-foreground/20">
              <Leaf className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Take Action</h3>
              <p className="text-sm text-primary-foreground/80">
                Get personalized tips to reduce emissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;