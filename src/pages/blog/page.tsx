import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogPosts } from '../../mocks/blog';
import PageLayout from '../../components/feature/PageLayout';

const categories = ['All', 'Testing', 'Research', 'Protocol'];

export default function Blog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((post) => post.category === activeCategory);

  const featuredPost = blogPosts[0];

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Vintage%20academic%20library%20with%20towering%20bookshelves%20filled%20with%20leather-bound%20books%2C%20warm%20brass%20reading%20lamps%20illuminating%20aged%20parchment%20and%20quill%20pens%2C%20scholarly%20atmosphere%20with%20rich%20espresso%20and%20brass%20tones%2C%20cinematic%20wide%20shot%2C%20academic%20research%20and%20knowledge%20archive%20aesthetic&width=1400&height=500&seq=blog-hero&orientation=landscape"
          alt="The Archive"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/50 via-foreground-950/40 to-foreground-950/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-accent-500 text-2xl">✦</span>
            <h1 className="font-heading text-3xl md:text-4xl tracking-[0.25em] uppercase text-background-50 mt-3">
              The Archive
            </h1>
            <p className="font-body text-sm italic text-background-50/70 mt-4 max-w-lg mx-auto">
              Research findings, testing methodologies, and peptide science from our laboratory notes.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-secondary-500/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600/60 mr-2">
              Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-heading text-[10px] tracking-[0.2em] uppercase px-4 py-1.5 border transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-accent-500 text-foreground-950 border-accent-500'
                    : 'text-foreground-600 border-secondary-500/30 hover:border-accent-500 hover:text-accent-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {activeCategory === 'All' && (
        <section className="py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 flex items-center justify-center text-accent-500">
                <i className="ri-star-fill text-[10px]" />
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">
                Featured Article
              </span>
            </div>

            <article
              onClick={() => navigate(`/blog/${featuredPost.id}`)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
            >
              <div className="relative aspect-[16/10] overflow-hidden accent-double-border">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/30 to-transparent" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500 border border-secondary-500/30 px-2 py-1">
                    {featuredPost.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-accent-500/40" />
                  <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600">
                    {featuredPost.date}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-accent-500/40" />
                  <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600">
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="font-heading text-xl md:text-2xl tracking-wider uppercase text-foreground-950 mb-4 group-hover:text-accent-500-dark transition-colors leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="font-body text-sm text-foreground-600 leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center">
                    <span className="font-heading text-[9px] text-accent-500">
                      {featuredPost.author.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <span className="font-body text-sm text-foreground-600">{featuredPost.author}</span>
                </div>

                <span className="flex items-center gap-1.5 text-accent-500 group-hover:text-accent-500-light transition-colors">
                  <span className="font-heading text-[10px] tracking-[0.15em] uppercase">
                    Read Full Article
                  </span>
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-xs" />
                  </span>
                </span>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Post Grid */}
      <section className="py-10 md:py-16 grain-overlay">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-accent-500 text-lg">✦</span>
              <h2 className="font-heading text-lg tracking-[0.2em] uppercase text-foreground-950">
                {activeCategory === 'All' ? 'All Articles' : `${activeCategory} Articles`}
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="group cursor-pointer accent-double-border bg-background-100/30 hover:bg-background-100/60 transition-colors duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden m-[4px]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/40 to-transparent" />
                </div>

                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">
                      {post.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-accent-500/40" />
                    <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm tracking-wider uppercase text-foreground-950 mb-3 group-hover:text-accent-500-dark transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-foreground-600/60">
                      {post.readTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-accent-500 group-hover:text-accent-500-light transition-colors">
                      <span className="font-heading text-[10px] tracking-[0.15em] uppercase">
                        Read More
                      </span>
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-right-line text-xs" />
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}