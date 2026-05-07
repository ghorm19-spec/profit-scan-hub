import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to Score Flipp" }] }),
  component: OnboardingPage,
});

const SLIDES = [
  { icon: Camera, title: "Scan anything", body: "Snap a photo of any used item. We identify it in seconds." },
  { icon: DollarSign, title: "See instant profit", body: "Real resale price range, fees, and your profit — calculated for you." },
  { icon: TrendingUp, title: "Sell smarter", body: "We tell you the best marketplace and how hot the category is right now." },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const Slide = SLIDES[i];
  const Icon = Slide.icon;

  function next() {
    if (i < SLIDES.length - 1) return setI(i + 1);
    if (typeof window !== "undefined") localStorage.setItem("sf_onboarded", "1");
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      <div className="flex justify-end">
        <button onClick={() => { localStorage.setItem("sf_onboarded", "1"); navigate({ to: "/auth" }); }} className="text-sm text-muted-foreground">Skip</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="h-24 w-24 rounded-3xl bg-gradient-hero grid place-items-center shadow-elevated mb-6">
          <Icon className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold">{Slide.title}</h1>
        <p className="mt-3 text-muted-foreground">{Slide.body}</p>
      </div>
      <div className="flex justify-center gap-1.5 mb-6">
        {SLIDES.map((_, idx) => (
          <span key={idx} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-muted"}`} />
        ))}
      </div>
      <Button onClick={next} className="w-full h-14 text-base bg-gradient-primary text-primary-foreground">
        {i < SLIDES.length - 1 ? "Next" : "Get started"} <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
