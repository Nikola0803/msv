import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Compounds',
    description: 'Single-peptide research compounds lyophilized to analytical grade standards.',
    icon: 'fa-solid fa-flask',
    link: '/shop?category=compounds',
  },
  {
    name: 'Blends',
    description: 'Pre-formulated peptide combinations optimized for synergistic research.',
    icon: 'fa-solid fa-layer-group',
    link: '/shop?category=blends',
  },
  {
    name: 'Bioregulators',
    description: 'Short-chain peptides targeting specific cellular and tissue functions.',
    icon: 'fa-solid fa-dna',
    link: '/shop?category=bioregulators',
  },
];

export default function CategoryTiles() {
  return (
    <section className="py-16 md:py-24 bg-background-100 grain-overlay">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <span className="text-accent-500 text-lg font-heading italic">✦</span>
          <h2 className="font-heading text-xl md:text-2xl tracking-[0.2em] uppercase text-foreground-950 mt-3 font-light">
            Browse by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {categories.map((cat, index) => (
            <Link
              key={index}
              to={cat.link}
              className="group relative overflow-hidden border border-secondary-500/40 hover:border-accent-500 transition-all duration-500 rounded-[2px]"
            >
              <div className="absolute inset-0 bg-foreground-950">
                <img
                  src="https://readdy.ai/api/search-image?query=Dark%20charcoal%20gray%20aged%20parchment%20texture%20with%20subtle%20grain%20and%20warm%20antique%20gold%20highlights%2C%20vintage%20apothecary%20paper%20background%2C%20seamless%20organic%20surface%20detail%2C%20elegant%20dark%20warm%20tone&width=400&height=400&seq=cat-texture-v2&orientation=squarish"
                  alt=""
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/40 via-transparent to-foreground-950/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/30 via-transparent to-foreground-950/30" />
              </div>
              <div className="relative z-10 p-6 md:p-8 min-h-[280px] flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full border border-secondary-500/60 flex items-center justify-center mb-5 group-hover:border-accent-500 group-hover:bg-accent-500/10 transition-all duration-300">
                  <span className="w-7 h-7 flex items-center justify-center text-secondary-500 group-hover:text-accent-500">
                    <i className={`${cat.icon} text-xl`} />
                  </span>
                </div>

                <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-background-50 mb-3 font-light">
                  {cat.name}
                </h3>

                <p className="font-body text-sm text-background-50/60 leading-relaxed flex-1 font-light">
                  {cat.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-accent-500 group-hover:text-accent-400 transition-colors">
                  <span className="font-heading text-[11px] tracking-[0.15em] uppercase">
                    View All
                  </span>
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-xs" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}