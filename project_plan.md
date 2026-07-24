# My Secret Vitality — Project Plan

## 1. Project Description
My Secret Vitality is a premium research peptide e-commerce brand. "Beauty Kept Quiet." — the site serves researchers and laboratories seeking high-purity peptide compounds. The core value is trust through transparency — batch COAs, HPLC purity data, and a rigorous testing philosophy communicated through an elegant, minimal design.

**Design System (v3 — Exact Spec):**
- **Colors:** Soft Ivory (#F5F1E8) page bg, Vintage Eucalyptus (#8E9A8A) hero/primary, Antique Gold (#B08D57) CTA/accent, Heritage Charcoal (#2F3430) navbar/footer, Weathered Linen (#DBD0C2) borders, Deep Sage (#4A5C4A) dark sections, Sage Muted (#7A8A76) muted text
- **Typography:** Cormorant Garamond (headings, weight 300/600 + italic), Montserrat (body, weight 300/400/500)
- **Rules:** Square-cornered buttons (2px radius), cards (4px radius), 0.5px #DBD0C2 borders, ✦ ornament spacer, wide uppercase letter-spacing (0.12-0.18em), no pure black, no rounded pills

**Target Users:** Research scientists, lab technicians, academic researchers in the US.
**Core Value:** 99%+ purity peptides with transparent COAs and elegant brand trust.

## 2. Page Structure
- `/` — Home (announcement bar, navbar, hero, trust strip, product grid, brand story, newsletter, footer)
- `/shop` — Full product catalog with search, filter, sort
- `/product/:id` — Product detail page (COA, tests, dosage, variants)
- `/about` — Brand story, founding principles, testing standards
- `/faqs` — Frequently asked questions accordion page
- `/contact` — Contact form + hours + location
- `/blog` — Research blog listing
- `/blog/:id` — Blog post detail
- `/track-order` — Order tracking lookup
- `/bundles` — Bundle/stack product pages
- `/bundle/:id` — Bundle detail
- `/login` — Age-gated login page
- `/register` — Age-gated registration page
- `/checkout` — Checkout page (mock)
- `/coa` — COA library
- Legal pages: privacy-policy, terms-of-service, return-policy, research-use-policy

## 3. Core Features
- [x] Age gate modal (21+ research confirmation) on first visit
- [x] Sitewide dismissible announcement bar
- [x] Sticky navigation with MSV monogram
- [x] Hero section with Vintage Eucalyptus background + eucalyptus watermark overlay
- [x] 4-column trust/feature strip
- [x] Product grid with 8 products, dosage selectors, purity badges, star ratings
- [x] Brand story section (Deep Sage dark section)
- [x] Newsletter subscription (real form submission via Readdy form backend)
- [x] Floating cart icon (bottom-right, appears when items in cart)
- [x] Full footer with 3 columns + social + disclaimer + back-to-top
- [x] Shopping cart drawer (mock — visual + local state)
- [ ] Shop page with real product data integration
- [ ] Product detail page with COA/tests tabs
- [ ] Blog pages
- [ ] Auth (login/register)

## 4. Product Catalog (8 Products)
| Code | Name | CAS | Purity | Sizes | Price | Stock |
|------|------|-----|--------|-------|-------|-------|
| BPC-157 | Body Protection Compound-157 | 137525-51-0 | 99.2% | 5/10/15mg | $89–$149 | In Stock |
| TB-500 | Thymosin Beta-4 Fragment | 885340-08-9 | 99.1% | 2/5/10mg | $99–$179 | In Stock |
| CJC-1295 | CJC-1295 (No DAC) | 86168-78-7 | 99.0% | 2/5/10mg | $79–$139 | In Stock |
| Ipamorelin | Ipamorelin Acetate | 170851-70-4 | 99.3% | 2/5mg | $69–$119 | Low Stock |
| Semaglutide | GLP-1 Receptor Agonist | 910463-68-2 | 99.1% | 3/5/10mg | $149–$299 | Only 15 Left |
| Tirzepatide | Dual GIP/GLP-1 Agonist | 2023788-19-2 | 99.0% | 5/10/15mg | $199–$399 | In Stock |
| Melanotan II | Melanotan II Acetate | 121062-08-6 | 98.9% | 10mg | $59–$99 | In Stock |
| PT-141 | Bremelanotide | 189691-06-3 | 99.0% | 10mg | $69–$109 | In Stock |

## 5. Backend / Third-party Integration Plan
- **Supabase Auth:** Required for login/register. Not yet connected.
- **Supabase Database:** Products, bundles, blog posts (future phase). Currently using mock data.
- **Readdy Forms:** Newsletter subscription connected via Readdy form backend.
- **Stripe:** Not needed yet. Mock cart only.
- **Shopify:** Not needed. Products stored in mock data.

## 6. Development Phase Plan

### Phase 1: Home Page Complete ✅
- Goal: Establish the full visual identity and build the complete Home page
- Deliverable: Announcement bar, navbar, hero, trust strip, product grid (8 products), brand story, newsletter (real form), footer, floating cart, age gate. All mock data.
- Status: COMPLETE

### Phase 2: Shop + Product Detail Pages
- Goal: Build the full product catalog and detail experience
- Deliverable: Shop page with search/filter/sort using new ProductCard, Product detail page

### Phase 3: Remaining Pages + Polish
- Goal: Update all remaining pages and remove legacy CSS classes
- Deliverable: About, FAQs, Contact, Blog, Legal pages rebranded. Clean up unused CSS utility classes.