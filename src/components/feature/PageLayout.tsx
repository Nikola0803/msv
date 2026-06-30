import { ReactNode } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import AgeGate from './AgeGate';

interface PageLayoutProps {
  children: ReactNode;
  showAgeGate?: boolean;
  showAnnouncement?: boolean;
}

export default function PageLayout({ children, showAgeGate = true, showAnnouncement = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#E1E4D9]">
      {showAgeGate && <AgeGate />}
      {showAnnouncement && <AnnouncementBar />}
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}