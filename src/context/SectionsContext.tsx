/**
 * SectionsContext — fetches all CMS section data from the WP backend once at
 * app startup and makes it available everywhere via useSections().
 *
 * Falls back to hardcoded defaults if the API is unreachable or slow.
 * If the backend returns HTTP 402, the site enters maintenance mode.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionsData {
  _maintenance: boolean;
  hero: {
    bg_image_url: string;
    label1: string;
    label2: string;
    headline: string;
    tagline: string;
    cta1_label: string;
    cta1_url: string;
    cta2_label: string;
    cta2_url: string;
    stat_items: { icon: string; text: string }[];
  };
  announcement: { text: string };
  ticker: { items: string[] };
  trust_pillars: { pillars: { icon: string; title: string; description: string }[] };
  brand_story: {
    label: string;
    headline: string;
    body: string;
    cta_label: string;
    cta_url: string;
    image_url: string;
  };
  press: {
    label: string;
    headline: string;
    subheadline: string;
    certs: { icon: string; label: string; description: string; detail: string }[];
  };
  editorial: {
    headline: string;
    body: string;
    checklist: string[];
    closing: string;
    image_url: string;
  };
  accordion: {
    section_heading: string;
    panels: { title: string; content: string }[];
  };
  testimonials: {
    label: string;
    headline: string;
    tagline: string;
    agg_rating: string;
    agg_reviews: string;
    agg_purity: string;
    agg_coa: string;
    items: { name: string; role: string; initials: string; rating: string; quote: string }[];
  };
  faq_home: {
    label: string;
    headline: string;
    tagline: string;
    contact_text: string;
    contact_url: string;
    items: { q: string; a: string }[];
  };
  quality: {
    label: string;
    headline: string;
    subheadline: string;
    seal_title: string;
    seal_desc: string;
    cards: { icon: string; title: string; description: string }[];
    cta_label: string;
    cta_url: string;
  };
  howitworks: {
    label: string;
    headline: string;
    subheadline: string;
    steps: { icon: string; title: string; description: string }[];
  };
  newsletter: {
    headline: string;
    tagline: string;
    placeholder: string;
    submit_label: string;
    success_heading: string;
    success_body: string;
    disclaimer: string;
  };
  footer: {
    instagram_url: string;
    facebook_url: string;
    email: string;
    copyright: string;
  };
  about: {
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    stats: { value: string; label: string }[];
    quote: string;
  };
  veterans: {
    headline: string;
    tagline: string;
    discount_pct: string;
    qualifies: string[];
    steps: { title: string; desc: string }[];
    contact_email: string;
    disclaimer: string;
  };
  contact_page: {
    heading: string;
    email_label: string;
    email: string;
    hours_weekday: string;
    hours_saturday: string;
    hours_sunday: string;
    success_heading: string;
    success_body: string;
  };
  privacy_policy:      { content: string; effective_date: string };
  terms_of_service:    { content: string; effective_date: string };
  return_policy:       { content: string; effective_date: string };
  research_use_policy: { content: string; effective_date: string };
}

// ─── Hardcoded defaults (exact values from TSX components) ───────────────────

const DEFAULTS: SectionsData = {
  _maintenance: false,
  hero: {
    bg_image_url: '',
    label1:       'Private Wellness',
    label2:       'Extraordinary Results',
    headline:     'Private\nWellness.\nExtraordinary\nResults.',
    tagline:      'Beauty Kept Quiet.',
    cta1_label:   'SHOP PEPTIDES',
    cta1_url:     '/shop',
    cta2_label:   'VIEW COA LIBRARY →',
    cta2_url:     '/coa',
    stat_items: [
      { icon: 'ri-shield-check-line', text: '99%+ Purity' },
      { icon: 'ri-file-text-line',    text: 'COA Included' },
      { icon: 'ri-truck-line',        text: 'Discreet Shipping' },
    ],
  },
  announcement: {
    text: '✦ Third-Party Tested · Certificate of Analysis Provided · Research Grade Purity ✦',
  },
  ticker: {
    items: [
      'Free Shipping $200+',
      '99%+ HPLC Purity',
      'Research Use Only',
      'Not for Human Consumption',
      'USA Made',
      'Batch COA Included',
    ],
  },
  trust_pillars: {
    pillars: [
      { icon: 'ri-flask-line',       title: 'Lab Tested USA',      description: 'Every batch is lyophilized in certified US laboratories under strict GMP-adjacent protocols. Domestic production means faster delivery and full traceability.' },
      { icon: 'ri-award-line',       title: '99%+ Purity',         description: 'Our HPLC analytical standards demand a minimum of 99% purity. Most batches exceed 99.2%. We do not release anything that falls below our threshold.' },
      { icon: 'ri-file-list-3-line', title: 'Batch COA',           description: 'Every vial ships with its corresponding Certificate of Analysis. Lot numbers are matched, dated, and digitally archived for your research records.' },
      { icon: 'ri-truck-line',       title: 'Nationwide Shipping', description: 'Temperature-controlled packaging with cold packs and insulated liners. Free expedited shipping on all orders over $200. Same-day dispatch before 2 PM EST.' },
    ],
  },
  brand_story: {
    label:     'OUR STORY',
    headline:  'The Secret Behind the Science',
    body:      "My Secret Vitality was built for those who understand that true wellness is private, precise, and backed by science. We source, test, and verify every compound we offer — because your results depend on what's actually in the vial.",
    cta_label: 'OUR STORY →',
    cta_url:   '/about',
    image_url: '',
  },
  press: {
    label:       'VERIFIED EXCELLENCE',
    headline:    'Certified. Tested.\nIndependently Verified.',
    subheadline: 'Your research deserves the highest standard.',
    certs: [
      { icon: 'ri-microscope-line',   label: 'ISO 17025',    description: 'Certified Laboratory',    detail: 'Tested by accredited facilities' },
      { icon: 'ri-shield-check-line', label: 'GMP',          description: 'Good Manufacturing',      detail: 'Practice compliant sourcing' },
      { icon: 'ri-file-shield-line',  label: 'COA Verified', description: 'Certificate of Analysis', detail: 'Batch-specific documentation' },
      { icon: 'ri-test-tube-line',    label: 'HPLC',         description: 'High-Performance Liquid', detail: 'Chromatography verified' },
      { icon: 'ri-dna-line',          label: 'Mass Spec',    description: 'Mass Spectrometry',       detail: 'Molecular weight confirmed' },
    ],
  },
  editorial: {
    headline:  'Purity Is the Baseline —\nRelease Standards Are the Difference',
    body:      'Every My Secret Vitality batch undergoes a rigorous six-point analytical protocol before it ever reaches our cold storage. HPLC purity verification is merely the beginning.',
    checklist: [
      'HPLC Purity Analysis (≥99%)',
      'Mass Spectrometry Identity Confirmation',
      'Endotoxin Screening (LAL Test)',
      'Residual Solvent Analysis (GC-MS)',
      'Heavy Metals Panel (ICP-MS)',
      'Sterility & Bioburden Testing',
    ],
    closing:   'Our COAs are not marketing documents — they are complete analytical records, dated, signed, and matched to your specific lot number. We archive every result for five years.',
    image_url: '',
  },
  accordion: {
    section_heading: 'Why We Are Different',
    panels: [
      { title: 'The Problem',  content: 'The research peptide market is flooded with under-tested compounds, inconsistent dosing, and vendors who treat transparency as optional. Researchers waste precious resources on peptides that fail to meet basic analytical standards — compromising their data, their time, and the integrity of their work.' },
      { title: 'The Solution', content: 'Every batch we release is validated by independent third-party HPLC and Mass Spectrometry testing. We publish complete Certificates of Analysis with every order, so you know exactly what you are working with. No guesswork. No ambiguity. Just verified, high-purity research materials.' },
      { title: 'What We Do',   content: 'My Secret Vitality synthesizes and supplies research-grade peptides for qualified laboratories and research institutions. We maintain stringent cold-chain handling, batch-tracked inventory, and a direct relationship with our synthesis partners — because your research demands more than a middleman.' },
    ],
  },
  testimonials: {
    label:       'TESTIMONIALS',
    headline:    'Trusted by Researchers\nWorldwide',
    tagline:     'Real feedback from those who rely on our peptides.',
    agg_rating:  '4.8',
    agg_reviews: '1,600+',
    agg_purity:  '99.1%',
    agg_coa:     '100%',
    items: [
      { name: 'Dr. Michael R.', role: 'Independent Researcher',    initials: 'MR', rating: '5', quote: "The purity and documentation are unmatched. I've ordered from six different suppliers and My Secret Vitality is the only one that consistently delivers batch-specific COAs with every shipment. This is now my sole source." },
      { name: 'Sarah K.',       role: 'Clinical Investigator',     initials: 'SK', rating: '5', quote: "Discreet packaging, fast shipping, and the product quality speaks for itself. The third-party testing transparency gives me complete confidence in what I'm working with. Absolutely professional from start to finish." },
      { name: 'James T.',       role: 'Biochemistry Lab Director', initials: 'JT', rating: '5', quote: 'I was hesitant about ordering peptides online, but their customer service team walked me through the entire process. The COA library access is a game-changer for anyone serious about research integrity.' },
      { name: 'Elena V.',       role: 'Long-Term Researcher',      initials: 'EV', rating: '5', quote: 'Been a customer for over a year now. Every order has been consistent — same purity, same careful packaging, same attention to detail. That kind of reliability is rare in this space. Highly recommend.' },
      { name: 'Robert C.',      role: 'Pharmacology Researcher',   initials: 'RC', rating: '5', quote: "The research community talks, and My Secret Vitality has earned its reputation. The BPC-157 and TB-500 I received were exactly as described — crystal clear reconstitution, no cloudiness, and the expected biological activity in our models." },
      { name: 'Dr. Amanda L.', role: 'Academic Research Fellow',  initials: 'AL', rating: '5', quote: "What sets them apart is the documentation. Full HPLC traces, mass spec data, everything you need for publication-grade work. When your research depends on knowing exactly what's in the vial, there's no substitute." },
    ],
  },
  faq_home: {
    label:        'FAQ',
    headline:     "Questions? We've Got\nAnswers.",
    tagline:      'Everything you need to know before you order.',
    contact_text: 'Still have questions?',
    contact_url:  '/contact',
    items: [
      { q: 'Are your peptides legal to purchase?',      a: 'Yes. All peptides in our catalog are sold strictly for research and laboratory use only. They are not intended for human consumption, diagnostic purposes, or therapeutic applications. Our products comply with all applicable research chemical regulations.' },
      { q: 'What is a Certificate of Analysis (COA)?', a: 'A Certificate of Analysis is an independently verified document that confirms the identity, purity, and composition of each peptide batch. It includes HPLC chromatograms, mass spectrometry data, and quantitative purity percentages. Every order from My Secret Vitality includes a batch-specific COA.' },
      { q: 'How should I store my peptides?',           a: 'Lyophilized (freeze-dried) peptides should be stored at -20°C in a frost-free freezer, protected from light and moisture. Once reconstituted, peptides should be stored at 2-8°C and used within the timeframe specified for that specific compound. Avoid repeated freeze-thaw cycles.' },
      { q: 'What payment methods do you accept?',       a: 'We accept wire transfers and cryptocurrency payments. All transactions appear under discreet billing descriptors to protect your privacy. Payment security is handled with 256-bit SSL encryption.' },
      { q: 'How long does shipping take?',              a: 'Domestic orders typically arrive within 3-5 business days. Express shipping options are available at checkout. All shipments include tracking and are fully insured.' },
      { q: 'Do you ship internationally?',              a: 'No. We currently ship to domestic US addresses only.' },
      { q: 'What is your return policy?',               a: 'All sales are final. We do not accept returns or offer refunds except in cases where a product arrives damaged or does not match its Certificate of Analysis. Claims for damaged or incorrect items must be submitted within 15 days of delivery with supporting photos. Opened vials cannot be returned under any circumstances.' },
      { q: 'Can I request a specific purity threshold?', a: "All our peptides meet a minimum 98.5% purity standard, with most exceeding 99%. If your research requires a specific purity threshold above our standard, please contact us before ordering and we'll do our best to accommodate your requirements." },
    ],
  },
  quality: {
    label:       'OUR PROMISE',
    headline:    'Quality You Can Verify.\nResults You Can Trust.',
    subheadline: "We don't just claim purity — we prove it. Every time.",
    seal_title:  'The MSV Quality Guarantee',
    seal_desc:   "If your research materials don't meet the documented purity standards, we'll replace them at our expense. Period.",
    cards: [
      { icon: 'ri-flask-line',        title: 'Third-Party Tested',        description: 'Every batch is independently analyzed by ISO-certified laboratories. HPLC purity reports and mass spectrometry data provided with every order.' },
      { icon: 'ri-file-text-line',    title: 'Full COA with Every Order', description: 'No blind trust required. Each shipment includes a complete Certificate of Analysis showing exact purity percentage, residual solvents, and heavy metal screening.' },
      { icon: 'ri-shield-check-line', title: 'Satisfaction Guarantee',    description: "If you're not completely satisfied with the quality of your order, we'll replace it or refund it — no questions, no hassle, no exceptions." },
      { icon: 'ri-truck-line',        title: 'Discreet & Secure Shipping', description: 'Plain packaging, temperature-controlled when needed, fully insured. Your privacy and the integrity of your research materials are our priority.' },
      { icon: 'ri-user-voice-line',   title: 'Dedicated Support',         description: "Real researchers answering your questions. Whether you need help with reconstitution protocols or COA interpretation, we're here." },
    ],
    cta_label: 'VIEW COA LIBRARY →',
    cta_url:   '/coa',
  },
  howitworks: {
    label:       'HOW IT WORKS',
    headline:    'From Browse to Breakthrough',
    subheadline: 'Four simple steps to research-grade peptides at your door.',
    steps: [
      { icon: 'ri-search-line',        title: 'Browse & Select',   description: 'Explore our catalog of research-grade peptides. Each product page includes full purity data, CAS numbers, and available dosage options so you can make an informed choice.' },
      { icon: 'ri-shopping-cart-line', title: 'Place Your Order',  description: 'Secure checkout with discreet billing. Select your preferred dosage size, add to cart, and complete your order in under two minutes. No account required.' },
      { icon: 'ri-box-3-line',         title: 'Discreet Delivery', description: 'Your order ships in plain, temperature-stable packaging with full tracking. Most orders arrive within 3-5 business days. International shipping available.' },
      { icon: 'ri-file-chart-line',    title: 'Verify & Research', description: 'Every shipment includes a batch-specific Certificate of Analysis. Verify purity independently through our online COA library, then proceed with confidence.' },
    ],
  },
  newsletter: {
    headline:        'Stay in the know.',
    tagline:         'Exclusive updates, new drops, and wellness insights.',
    placeholder:     'Enter your email address',
    submit_label:    'SUBSCRIBE',
    success_heading: "You're on the list.",
    success_body:    'Welcome to My Secret Vitality. Expect exclusive updates soon.',
    disclaimer:      'We respect your privacy. Unsubscribe at any time.',
  },
  footer: {
    instagram_url: 'https://instagram.com',
    facebook_url:  'https://facebook.com',
    email:         'help@mysecretvitality.com',
    copyright:     '© 2025 My Secret Vitality. All rights reserved.',
  },
  about: {
    paragraph1: 'My Secret Vitality was founded in 2024 by a collective of peptide chemists, analytical methodologists, and former clinical researchers who shared a common frustration: the research peptide market had become a race to the bottom, where transparency was optional and purity was negotiable.',
    paragraph2: 'We set out to build something different. A supplier that treats every vial as a commitment to scientific integrity. Where batch testing is not a marketing checkbox but a non-negotiable standard. Where researchers can trust the label without second-guessing the contents.',
    paragraph3: 'Our synthesis partners operate GMP-adjacent facilities in the United States. Every batch is independently verified by third-party laboratories using HPLC, mass spectrometry, and a full panel of analytical tests. We do not release anything below 99% purity. Ever.',
    stats: [
      { value: '12,000+', label: 'Vials Shipped' },
      { value: '99.2%',   label: 'Average Purity' },
      { value: '100%',    label: 'Batch Tested' },
    ],
    quote: '"Not a product. A pursuit."',
  },
  veterans: {
    headline:      'Veteran & First Responder Discount',
    tagline:       '15% off — our way of saying thank you.',
    discount_pct:  '15',
    qualifies: [
      'Active duty military (all branches)',
      'Military veterans (honorably discharged)',
      'Law enforcement officers',
      'Firefighters and EMTs / paramedics',
      'First responders and emergency medical personnel',
    ],
    steps: [
      { title: 'Email Us',             desc: 'Send an email to help@mysecretvitality.com with the subject line "Veteran/First Responder Discount."' },
      { title: 'Provide Verification', desc: 'Include a photo or scan of your military ID, veteran ID, badge, or other proof of service/employment. All documentation is kept strictly confidential.' },
      { title: 'Receive Your Code',    desc: "Once verified, we'll send you a 15% discount code to use at checkout. Codes are valid for ongoing use." },
    ],
    contact_email: 'help@mysecretvitality.com',
    disclaimer:    'Discount applies to all products. Cannot be combined with other promotional offers. One discount code per household. My Secret Vitality reserves the right to verify eligibility and revoke codes at any time.',
  },
  contact_page: {
    heading:         'Contact Our Research Team',
    email_label:     'Email',
    email:           'help@mysecretvitality.com',
    hours_weekday:   '9:00 AM – 6:00 PM MST',
    hours_saturday:  '10:00 AM – 2:00 PM MST',
    hours_sunday:    'Closed',
    success_heading: 'Message Received',
    success_body:    'Our research team will respond within 24 hours.',
  },
  privacy_policy:      { content: '', effective_date: 'January 1, 2026' },
  terms_of_service:    { content: '', effective_date: 'January 1, 2026' },
  return_policy:       { content: '', effective_date: 'January 1, 2026' },
  research_use_policy: { content: '', effective_date: 'January 1, 2026' },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SectionsContextValue {
  sections: SectionsData;
  fromCMS: boolean;
  loading: boolean;
}

const SectionsContext = createContext<SectionsContextValue>({
  sections: DEFAULTS,
  fromCMS:  false,
  loading:  true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

const WP_URL = (import.meta.env.VITE_WP_URL as string | undefined) ?? 'https://db.vintagepeptides.com';
const SECTIONS_ENDPOINT = `${WP_URL}/wp-json/msv/v1/sections`;

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<SectionsData>(DEFAULTS);
  const [fromCMS,  setFromCMS]  = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // 5 s timeout

    fetch(SECTIONS_ENDPOINT, { signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timer);
        if (res.status === 402) {
          setSections((prev) => ({ ...prev, _maintenance: true }));
          setFromCMS(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SectionsData = await res.json();
        setSections({ ...DEFAULTS, ...data });
        setFromCMS(true);
      })
      .catch(() => {
        clearTimeout(timer);
        setFromCMS(false);
      })
      .finally(() => setLoading(false));

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  return (
    <SectionsContext.Provider value={{ sections, fromCMS, loading }}>
      {children}
    </SectionsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSections() {
  return useContext(SectionsContext);
}
