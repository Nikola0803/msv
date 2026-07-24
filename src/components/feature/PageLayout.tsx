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
      {/* WCAG 2.1 — skip navigation link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[#B08D57] focus:text-[#2F3430] focus:text-sm focus:font-semibold focus:px-4 focus:py-2 focus:rounded-[2px] focus:shadow-lg"
      >
        Skip to main content
      </a>
      {showAgeGate && <AgeGate />}
      {showAnnouncement && <AnnouncementBar />}
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}