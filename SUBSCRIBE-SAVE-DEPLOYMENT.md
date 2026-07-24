# Subscribe & Save — Deployment Checklist (My Secret Vitality)

> All code changes are already saved in the repo. This covers what needs to happen on the
> WordPress/VPS side and in Vercel to make Subscribe & Save actually usable on this storefront.

---

## Background

The `msv-subscriptions` WP plugin (daily renewal cron, discount tiers, admin subscriptions list,
renewal emails) already existed and was fully working — but there was no way for a customer to
ever create a subscription in the first place: no toggle on product cards, no cart/checkout
support, no `/renew` page. That frontend has now been built (mirroring Vintage Peptides' existing
implementation, themed for this storefront).

**One backend fix was also needed:** MSV orders are built from WooCommerce `fee_lines` (no
product catalog/SKUs yet), not real `line_items` like Vintage Peptides uses. The subscriptions
plugin's hook originally tried to read the subscribed items off `$order->get_items()`, which only
ever returns real line items — on an MSV order that's always empty, so subscriptions would have
been saved with no items at all. Fixed by having checkout hand the plugin a self-contained JSON
snapshot of the cart (`subscription_items` order meta) instead of relying on WooCommerce's line
item structure.

---

## 1. Re-upload the `msv-subscriptions` Plugin

Copy the updated `wp-plugins/msv-subscriptions/` folder to `/var/www/html/wp-content/plugins/`
on the shared WordPress install (same one Vintage Peptides uses), replacing the existing version.

Then: WP Admin → Plugins → deactivate the old version → activate the new one.

## 2. Flush Permalinks

WP Admin → Settings → Permalinks → click **Save Changes** (no need to change anything). This isn't
strictly required since the REST namespace (`msv-subs/v1`) hasn't changed, but do it anyway after
any plugin re-upload — cheap insurance against 404s.

## 3. Confirm Discount Tiers

WP Admin → Subscriptions → Discount Tiers. Defaults are already 30/10%, 60/12%, 90/15%, 180/20%
(matching the frontend's hardcoded fallback), so no action needed unless you want different rates
for this storefront.

## 4. Confirm the Frontend URL Option

The renewal email's "Complete Renewal" link is built from the `msv_products_frontend_url` option
(falls back to `https://mysecretvitality.com` if unset). Confirm it's set correctly, or leave it —
the fallback is already correct for production.

## 5. Flip the Frontend Flag

In the Vercel dashboard for the **msv** project, add environment variable
`VITE_ENABLE_SUBSCRIPTIONS` = `true` (Production + Preview), then redeploy. Until this is set, the
Subscribe & Save toggle stays hidden on product cards, same kill-switch pattern as Vintage
Peptides.

## 6. Test End to End

1. Add a product via "Subscribe & Save" instead of "Add to Cart", pick an interval, complete
   checkout.
2. Check WP Admin → Subscriptions → All Subscriptions — the new subscription should appear with
   status Active, the correct next renewal date, **and a non-empty item list** (this is the part
   the fee_lines fix was for — double check it isn't blank).
3. To test the renewal/email flow without waiting for the real date: edit the row's `next_renewal`
   date directly in the database to today or earlier, then either wait for the next scheduled cron
   run or trigger it manually (WP-CLI: `wp cron event run msv_subs_daily_renewals`). Confirm the
   renewal email arrives with a working "Complete Renewal" link that pre-fills the cart on
   `/renew`.

---

## Summary Checklist

- [ ] Re-upload `msv-subscriptions` plugin → deactivate old → activate new
- [ ] WP Admin → Settings → Permalinks → Save Changes
- [ ] Confirm discount tiers (WP Admin → Subscriptions → Discount Tiers)
- [ ] Confirm `msv_products_frontend_url` option
- [ ] Vercel (msv project) → add `VITE_ENABLE_SUBSCRIPTIONS=true` env var
- [ ] Place test Subscribe & Save order → verify it shows up with items in WP Admin → Subscriptions
- [ ] Force a renewal (edit `next_renewal` + run cron) → verify renewal email + `/renew` link work
