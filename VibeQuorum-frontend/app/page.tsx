import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import TrendingQuestions from "@/components/trending-questions"
import HowItWorks from "@/components/how-it-works"
import FeaturesSection from "@/components/features-section"
import StatsSection from "@/components/stats-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TrendingQuestions />
      <FeaturesSection />
      <StatsSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  )
}
