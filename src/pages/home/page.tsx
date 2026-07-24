import TickerBar from '@/components/feature/TickerBar';
import AnnouncementBar from '@/components/feature/AnnouncementBar';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import AgeGate from '@/components/feature/AgeGate';
import HeroSection from './components/HeroSection';
import ResearchUseWarning from './components/ResearchUseWarning';
import ProductGrid from './components/ProductGrid';
import CategoryTiles from './components/CategoryTiles';
import EditorialStrip from './components/EditorialStrip';
import QualityPromise from './components/QualityPromise';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Newsletter from './components/Newsletter';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E1E4D9]">
      <AgeGate />
      <TickerBar />
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <ResearchUseWarning />
        <ProductGrid />
        <CategoryTiles />
        <EditorialStrip />
        <QualityPromise />
        <HowItWorks />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}