# Acceptance Criteria — Combined

> All checks below must pass before the work is considered done. Verify locally first, then again on the deployed site.

## Build & schema

- [ ] `npm install` succeeds.
- [ ] `npm run check` (tsc) passes with no errors.
- [ ] `npm run db:push` confirms the schema matches: `contact_submissions` table exists; `aboutPullQuote` (companies) and `comingSoon` (platforms) columns exist.

## About page (task 01)

- [ ] `https://llt.llc/about` renders the dedicated About page (not a homepage scroll).
- [ ] All four sections render: hero, What We Do, How We Work, Our Why with *"Our faith shapes our character, not our customer list"* intact, CTA section.
- [ ] "Learn more about Lamplight" link on the homepage navigates to `/about`.

## Routing & SPA

- [ ] `/platforms` and `/contact` render the homepage scrolled to the right anchor.
- [ ] `/careers` and `/insights` render the new pages.
- [ ] Hitting any unknown URL renders the polished gradient 404, not the dev message.

## Platforms

- [ ] AnchorPoint shows a working "Launch" link.
- [ ] The 6 portfolio platforms render with the "Coming Soon" badge and "In Development" indicator.
- [ ] Admin panel platform form has a Coming Soon Switch that persists.
- [ ] Admin platform list shows a Coming Soon badge for platforms in that state.

## Homepage polish

- [ ] *"Grounded in integrity, humility, purpose, and values."* pull-quote renders beneath the pillar cards.
- [ ] Footer shows current year (`new Date().getFullYear()`) and the values tagline.

## Meta / SEO / favicon (task 02)

- [ ] Browser tab shows the new title.
- [ ] `view-source` includes description, OG, and Twitter meta tags.
- [ ] `/favicon.svg`, `/apple-touch-icon.png`, `/og-image.png`, `/robots.txt`, `/sitemap.xml` all return 200.
- [ ] Pasting `https://llt.llc/` in Slack renders an unfurled card with image and description.

## Contact form (task 04)

- [ ] Form renders with Name, Company, Email, Interest dropdown (5 options), Message.
- [ ] Validation rejects missing required fields, invalid email, short message, invalid interest type.
- [ ] Successful submit inserts a row in `contact_submissions`.
- [ ] Notification email arrives at `info@llt.llc` with `Reply-To` = submitter.
- [ ] Confirmation email arrives at the submitter address.
- [ ] Success state replaces the form on 200.
- [ ] Toast on error; rate-limit message on 429.
- [ ] Submitting 6× from the same IP in an hour returns 429 on the 6th.
- [ ] If `RESEND_API_KEY` is unset, the API still returns 200 (row persists) and logs a warning.

## Mobile

- [ ] Form, About page, Careers, Insights, and homepage all look clean at ~375px viewport.

## Final report must explicitly flag

- [ ] Whether `RESEND_API_KEY` is in the deployment env or needs Todd to set it.
- [ ] Whether `llt.llc` is verified in the Resend dashboard, or DNS records (SPF/DKIM/DMARC) still need to be added.
- [ ] Whether `og-image.png`, `favicon.svg`, `apple-touch-icon.png` are real brand artwork or placeholders, with a list of what Todd should replace.
- [ ] That AnchorPoint case study + 1–2 Insights posts need source content from Todd before either is more than a stub.
