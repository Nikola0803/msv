import { useSections } from '@/context/SectionsContext';

export default function TickerBar() {
  const { sections } = useSections();
  const items = sections.ticker.items;

  const tickerContent = items.map((item, i) => (
    <span key={i} className="inline-flex items-center mx-8 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mr-3 flex-shrink-0" />
      <span className="font-sans text-[10px] tracking-widest uppercase text-[#2F3430] font-normal">
        {item}
      </span>
    </span>
  ));

  return (
    <div className="w-full bg-[#E1E4D9] border-b border-[#DBD0C2] overflow-hidden py-2.5 relative z-50">
      <div className="flex animate-ticker">
        <div className="flex items-center flex-shrink-0">
          {tickerContent}
        </div>
        <div className="flex items-center flex-shrink-0">
          {tickerContent}
        </div>
      </div>
    </div>
  );
}