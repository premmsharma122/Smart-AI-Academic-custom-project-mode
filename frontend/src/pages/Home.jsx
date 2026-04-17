import React from 'react';
import HomeNavbar from '../components/Home/HomeNavbar';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import AboutSection from '../components/Home/AboutSection';
import WhyChooseUsSection from '../components/Home/WhyChooseUsSection';
import StatsSection from '../components/Home/StatsSection';
import CtaSection from '../components/Home/CtaSection';
import HomeFooter from '../components/Home/HomeFooter';

const Home = () => {
  return (
    <div className="min-h-screen theme-page">
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <WhyChooseUsSection />
      <StatsSection />
      <CtaSection />
      <HomeFooter />
    </div>
  );
};

export default Home;
