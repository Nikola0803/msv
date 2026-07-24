import { useState } from 'react';
import { useSections } from '@/context/SectionsContext';

export default function AnnouncementBar() {
  const { sections } = useSections();
  const s = sections.announcement;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-[#B08D57] text-[#E1E4D9] py-2 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-center">
          {s.text}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 w-5 h-5 flex items-center justify-center text-[#E1E4D9]/70 hover:text-[#E1E4D9] transition-colors cursor-pointer"
          aria-label="Dismiss announcement"
        >
          <i className="ri-close-line text-xs" />
        </button>
      </div>
    </div>
  );
}