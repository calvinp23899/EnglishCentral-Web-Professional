import { HeroSection } from "../sections/HeroSection/HeroSection";
import { FeaturedCoursesSection } from "../sections/FeaturedCoursesSection/FeaturedCoursesSection";
import { WhyChooseUsSection } from "../sections/WhyChooseUsSection/WhyChooseUsSection";
import { TeachersSection } from "../sections/TeachersSection/TeachersSection";
import { CTASection } from "../sections/CTASection/CTASection";

import styles from "./HomePage.module.scss";

export function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <FeaturedCoursesSection />
      <WhyChooseUsSection />
      <TeachersSection />
      <CTASection />
    </div>
  );
}