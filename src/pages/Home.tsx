import React, { useEffect, useState } from "react";
import { useSourceData } from "../contexts/SourceDataContext";
import Hero from "./home/components/Hero";
import FeaturesGrid from "./home/components/FeaturesGrid";
import SourcesGrid from "./home/components/SourcesGrid";
import HowItWorks from "./home/components/HowItWorks";
import DemoSection from "./home/components/DemoSection";
import LandingFooter from "./home/components/LandingFooter";

const Home: React.FC = () => {
  const { sources } = useSourceData();
  const [stars, setStars] = useState<number | null>(null);

  // fetch GitHub stars once
  useEffect(() => {
    fetch("https://api.github.com/repos/unownone/spenddy")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => {});
  }, []);

  const handleGetStarted = () => {
    document.getElementById("sources")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onGetStarted={handleGetStarted} githubStars={stars} />
      <FeaturesGrid />
      <SourcesGrid sources={sources} />
      <HowItWorks />
      <DemoSection />
      <LandingFooter />
    </>
  );
};

export default Home; 