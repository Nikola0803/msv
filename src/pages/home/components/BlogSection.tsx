import { useNavigate } from 'react-router-dom';
import { blogPosts } from '../../../mocks/blog';

export default function BlogSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-background-50 grain-overlay">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <span className="text-accent-500 text-lg font-heading italic">✦</span>
          <h2 className="font-heading text-xl md:text-2xl tracking-[0.15em] uppercase text-foreground-950 mt-3 font-light">
            The Archive
          </h2>
          <p className="font-body text-sm italic text-foreground-600 mt-3 max-w-xl mx-auto font-light">
            Research findings, testing methodologies, and peptide science from our laboratory notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="group cursor-pointer accent-double-border bg-background-100/30 hover:bg-background-100/60 transition-colors duration-500 rounded-[2px]"
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
                  <span className="w-1 h-1 rounded-full bg-secondary-500/40" />
                  <span className="font-mono text-[10px] tracking-wider uppercase text-foreground-600">
                    {post.category}
                  </span>
                </div>

                <h3 className="font-heading text-sm tracking-wider uppercase text-foreground-950 mb-3 group-hover:text-accent-700 transition-colors leading-snug font-semibold">
                  {post.title}
                </h3>

                <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-foreground-600/60">
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-accent-500 group-hover:text-accent-400 transition-colors">
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

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/blog')}
            className="font-heading text-[11px] tracking-[0.15em] uppercase text-accent-500 border border-secondary-500/40 px-8 py-2.5 rounded-[2px] hover:bg-accent-500 hover:text-foreground-950 transition-colors"
          >
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
}