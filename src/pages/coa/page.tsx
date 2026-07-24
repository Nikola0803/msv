import { useState } from 'react';
import { coaEntries } from '@/mocks/coa';
import PageLayout from '@/components/feature/PageLayout';

interface DetailModalProps {
  entry: (typeof coaEntries)[0] | null;
  onClose: () => void;
}

function DetailModal({ entry, onClose }: DetailModalProps) {
  if (!entry) return null;

  const hasPdf = !!entry.coaUrl;
  const openPdf = () => {
    if (!hasPdf) return;
    window.open(entry.coaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#E1E4D9] border border-[#DBD0C2] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">{entry.batchNumber}</span>
              <h2 className="font-heading text-lg md:text-xl text-[#2F3430] mt-1">{entry.productName}</h2>
              <p className="font-sans text-sm text-[#3D4E3D] mt-1 font-light">{entry.peptideCode}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#3D4E3D] hover:text-[#2F3430] transition-colors flex-shrink-0"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div className="w-12 h-px bg-[#B08D57]/50 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/60 border border-[#DBD0C2]/40">
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Purity</p>
              <p className="font-mono text-xl text-[#2F3430]">{entry.purity}</p>
            </div>
            <div className="p-4 bg-white/60 border border-[#DBD0C2]/40">
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Test Date</p>
              <p className="font-mono text-sm text-[#2F3430]">{entry.testDate}</p>
            </div>
            <div className="p-4 bg-white/60 border border-[#DBD0C2]/40">
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Lab</p>
              <p className="font-sans text-sm text-[#2F3430] font-light">{entry.labName}</p>
            </div>
            <div className="p-4 bg-white/60 border border-[#DBD0C2]/40">
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Molecular Weight</p>
              <p className="font-mono text-sm text-[#2F3430]">{entry.molecularWeight}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Testing Methods</p>
            <div className="flex flex-wrap gap-2">
              {entry.methods.map((m) => (
                <span
                  key={m}
                  className="font-mono text-[10px] tracking-wider uppercase px-3 py-1 border border-[#DBD0C2] text-[#3D4E3D]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Amino Acid Sequence</p>
            <p className="font-mono text-xs text-[#2F3430] bg-white/60 p-4 border border-[#DBD0C2]/40 leading-relaxed break-all">
              {entry.sequence}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Appearance</p>
              <p className="font-sans text-sm text-[#2F3430] font-light">{entry.appearance}</p>
            </div>
            <div>
              <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Storage</p>
              <p className="font-sans text-sm text-[#2F3430] font-light">{entry.storage}</p>
            </div>
          </div>

          <div className="w-12 h-px bg-[#B08D57]/50 mb-6" />

          {hasPdf ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openPdf}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2F3430] text-[#E1E4D9] font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-[#B08D57] transition-colors whitespace-nowrap"
              >
                <i className="ri-file-list-3-line" />
                View COA PDF
              </button>
              <a
                href={entry.coaUrl}
                download
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#DBD0C2] text-[#2F3430] font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-[#B08D57] hover:text-[#E1E4D9] hover:border-[#B08D57] transition-colors whitespace-nowrap"
              >
                <i className="ri-download-line" />
                Download PDF
              </a>
            </div>
          ) : (
            <div className="p-4 border border-[#DBD0C2] bg-[#E1E4D9]/60 text-center">
              <p className="font-sans text-xs text-[#3D4E3D]">PDF document coming soon — contact <a href="mailto:help@mysecretvitality.com" className="text-[#B08D57] underline">help@mysecretvitality.com</a> to request this COA.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<(typeof coaEntries)[0] | null>(null);

  const filtered = coaEntries.filter((entry) => {
    const q = searchQuery.toLowerCase();
    return (
      entry.productName.toLowerCase().includes(q) ||
      entry.peptideCode.toLowerCase().includes(q) ||
      entry.batchNumber.toLowerCase().includes(q)
    );
  });

  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative bg-[#2F3430] text-[#E1E4D9] overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <span className="text-[#B08D57] text-lg">✦</span>
          <h1 className="font-heading text-2xl md:text-3xl tracking-[0.2em] uppercase mt-3 mb-4">
            Certificate of Analysis
          </h1>
          <p className="font-sans text-sm text-[#E1E4D9]/70 leading-relaxed max-w-2xl mx-auto font-light">
            Every batch is independently verified by third-party laboratories.
            Below is the complete archive of COA records for all active MSV batches,
            including HPLC purity data.
          </p>
        </div>
      </div>

      {/* Search + Table */}
      <div className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-[#DBD0C2]">
              <span className="w-5 h-5 flex items-center justify-center text-[#B08D57] flex-shrink-0">
                <i className="ri-search-line text-sm" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, peptide code, or batch number..."
                className="flex-1 bg-transparent font-sans text-sm text-[#2F3430] placeholder:text-[#3D4E3D]/60 focus:outline-none font-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 flex items-center justify-center text-[#3D4E3D] hover:text-[#2F3430]"
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border border-[#DBD0C2] bg-white text-[#3D4E3D] font-mono text-sm">
              <i className="ri-file-list-3-line text-xs text-[#B08D57]" />
              {filtered.length} records
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-[#DBD0C2] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DBD0C2] bg-[#E1E4D9]">
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Product</th>
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Batch</th>
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Test Date</th>
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Purity</th>
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Lab</th>
                  <th className="text-left font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Status</th>
                  <th className="text-right font-sans text-[10px] tracking-widest uppercase text-[#3D4E3D] px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[#DBD0C2]/40 hover:bg-[#E1E4D9]/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-sans text-sm font-medium text-[#2F3430]">{entry.productName}</p>
                      <p className="font-sans text-xs text-[#3D4E3D] mt-0.5 font-light">{entry.peptideCode}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[#2F3430]">{entry.batchNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[#3D4E3D]">{entry.testDate}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[#2F3430] font-semibold">{entry.purity}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-sans text-xs text-[#3D4E3D] font-light">{entry.labName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[#4A5C4A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                        Verified
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="w-8 h-8 flex items-center justify-center text-[#3D4E3D] hover:text-[#2F3430] border border-[#DBD0C2] hover:border-[#B08D57] transition-colors"
                          title="Details"
                        >
                          <i className="ri-eye-line text-sm" />
                        </button>
                        {entry.coaUrl ? (
                          <>
                            <a
                              href={entry.coaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center text-[#3D4E3D] hover:text-[#2F3430] border border-[#DBD0C2] hover:border-[#B08D57] transition-colors"
                              title="View COA PDF"
                            >
                              <i className="ri-file-pdf-line text-sm" />
                            </a>
                            <a
                              href={entry.coaUrl}
                              download
                              className="w-8 h-8 flex items-center justify-center text-[#3D4E3D] hover:text-[#2F3430] border border-[#DBD0C2] hover:border-[#B08D57] transition-colors"
                              title="Download PDF"
                            >
                              <i className="ri-download-line text-sm" />
                            </a>
                          </>
                        ) : (
                          <span className="font-mono text-[9px] text-[#3D4E3D]/60 uppercase tracking-wider px-2">
                            PDF soon
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="border border-[#DBD0C2] bg-white p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans text-sm font-medium text-[#2F3430]">{entry.productName}</p>
                    <p className="font-sans text-xs text-[#3D4E3D] mt-0.5 font-light">{entry.peptideCode}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-wider uppercase text-[#4A5C4A] flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-[#B08D57]">Batch</p>
                    <p className="font-mono text-xs text-[#2F3430]">{entry.batchNumber}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-[#B08D57]">Date</p>
                    <p className="font-mono text-xs text-[#2F3430]">{entry.testDate}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-[#B08D57]">Purity</p>
                    <p className="font-mono text-sm text-[#2F3430] font-semibold">{entry.purity}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-[#B08D57]">Lab</p>
                    <p className="font-sans text-xs text-[#2F3430] font-light">{entry.labName}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#DBD0C2] font-sans text-[10px] tracking-wider uppercase text-[#2F3430] hover:bg-[#2F3430] hover:text-[#E1E4D9] hover:border-[#2F3430] transition-colors"
                  >
                    <i className="ri-eye-line text-xs" />
                    Details
                  </button>
                  {entry.coaUrl ? (
                    <>
                      <a
                        href={entry.coaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#DBD0C2] font-sans text-[10px] tracking-wider uppercase text-[#2F3430] hover:bg-[#B08D57] hover:text-[#E1E4D9] hover:border-[#B08D57] transition-colors"
                      >
                        <i className="ri-file-pdf-line text-xs" />
                        View COA
                      </a>
                      <a
                        href={entry.coaUrl}
                        download
                        className="flex items-center justify-center px-3 py-2 border border-[#DBD0C2] text-[#3D4E3D] hover:text-[#2F3430] hover:border-[#B08D57] transition-colors"
                        title="Download"
                      >
                        <i className="ri-download-line text-sm" />
                      </a>
                    </>
                  ) : (
                    <span className="flex-1 flex items-center justify-center font-mono text-[9px] text-[#3D4E3D]/60 uppercase tracking-wider border border-[#DBD0C2]/40 py-2">
                      PDF soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 border border-[#DBD0C2] bg-white">
              <i className="ri-search-line text-2xl text-[#3D4E3D]/40 mb-4 block" />
              <p className="font-sans text-sm text-[#3D4E3D]">No records found</p>
              <p className="font-sans text-xs text-[#3D4E3D]/60 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Testing Methodology */}
      <div className="py-12 md:py-16 bg-[#E1E4D9]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <span className="text-[#B08D57] text-lg">✦</span>
            <h2 className="font-heading text-lg md:text-xl tracking-[0.2em] uppercase text-[#2F3430] mt-3">
              Our Testing Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'ri-bar-chart-line',
                title: 'HPLC Analysis',
                description:
                  'High Performance Liquid Chromatography determines purity and identifies impurities. Each sample is run against reference standards at 99%+ minimum resolution.',
              },
              {
                icon: 'ri-flask-line',
                title: 'Mass Spectrometry',
                description:
                  'Electrospray ionization mass spectrometry confirms molecular weight and identity. MALDI-TOF is used for larger peptide sequences.',
              },
              {
                icon: 'ri-file-check-line',
                title: 'Third-Party Verified',
                description:
                  'All testing is performed by ISO 17025 accredited independent labs. COAs are digitally archived and cross-referenced by batch number.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 border border-[#DBD0C2] bg-white/60">
                <div className="mx-auto w-12 h-12 rounded-full border border-[#B08D57] flex items-center justify-center mb-4">
                  <i className={`${item.icon} text-sm text-[#B08D57]`} />
                </div>
                <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-[#2F3430] font-medium mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-[#3D4E3D] leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </PageLayout>
  );
}
