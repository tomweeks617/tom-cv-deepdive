# Ocado Retail — Data Analyst → Senior Data Analyst → Data Engineer (April 2021 – April 2024)

Tom spent three years at Ocado Retail building data products, monetisation solutions and analytics systems for Ocado's **retail media** business (the business of selling advertising and media placements to the suppliers whose products Ocado sells). He was promoted twice: Data Analyst → Senior Data Analyst → Data Engineer, moving from analysis into engineering ownership.

This is where most of Tom's headline revenue numbers come from.

## The £1m revenue workshop (420% growth)

**Situation:** Tom was the first hire in a new team specifically created to monetise media space on Ocado's website — sponsored products, banners and similar placements. There were four categories of placement: tenancy (fixed price, fixed period, largest suppliers, always took precedence), free locations (internal buyers promoting products in Ocado's interest — margin, stock availability), backfill (an algorithm that populated any unfilled placements, which Tom owned and developed), and auction (any non-tenancy inventory where smaller suppliers bid on a cost-per-click basis). When Tom joined, the auction channel was generating approximately **£600 per week**.

**Task:** As the founding hire with no playbook, Tom was responsible for the full stack — warehouse engineering, analysis, reporting, product strategy and automation — with an implicit mandate to grow the untapped auction channel.

**Action:** Tom ran a weekly workshop with the account management team, built around dashboards he designed to surface both the macro revenue picture and specific micro-level opportunities. Each week, the workshop translated data signals into direct supplier outreach. Typical actions included:
- Notifying suppliers that their prepaid wallet had run out or campaigns had expired
- Flagging that they were not bidding on all relevant search terms or media placements
- Sharing ROI data for placements where Ocado wanted to drive more supplier competition
- Working with Ocado buyers to onboard new small suppliers onto the Citrus ad-tech auction platform

Alongside the workshop, Tom built three data products to systematise and scale what the team was doing manually:
1. **Automated real-time emails** to suppliers whose campaigns or wallets were running low — stopping revenue from silently draining
2. **Algorithm improvement** — refined the auction-winning algorithm by incorporating click-through rate alongside CPC bid, improving the quality of outcomes for both Ocado and suppliers
3. **Automated monthly supplier reports** — personalised emails summarising each supplier's last-month performance and quantifying the revenue they missed out on due to wallet depletion, expired campaigns, low bids, or gaps in search-term coverage

**Result:** Auction revenue grew from ~£600/week to over **£26,000/week** in 12 months — a **420% increase**, equating to roughly **£1 million of incremental annualised revenue**, all at over 95% margin. The work also had external recognition: the ad-tech platform partner (Citrus) asked Tom to demo the automated email technology and subsequently added it to their own product roadmap. Suppliers valued the communications so highly that during an incident (an API key rotation that temporarily interrupted the emails), they proactively reached out asking why they had not received their reports — treating them as business-critical.

## Ad-tech API integration (2,000+ hours/year saved)

**Situation:** All tenancy media at Ocado (fixed placements sold at a fixed price for a fixed period) was booked via email agreements between Ocado buyers and suppliers. Once agreed, each buyer manually entered every booking into the Citrus ad-tech platform — a multi-page form covering go-live dates, campaign name, search terms, pricing, platform (app and/or web), and more — taking several minutes per asset. With approximately **5,000 assets loaded per month**, there was no central visibility of all commitments, no clash detection between buyers, no validity checking (e.g. incorrect product codes), and no revenue reporting until the day media went live. Even then, the reported price depended entirely on the buyer entering the correct figure. Tom identified this as a fundamental, unscalable problem shortly after joining.

**Task:** Find a solution before the annual media launch — Tom had approximately **two months** before Ocado was locked in for the year.

**Action:** Tom defined a long-term vision of a self-serve supplier booking portal but, given the time constraint, delivered an immediate practical solution first:

1. **Validated booking templates** — built a heavily validated spreadsheet template with dynamic validation rules, allowing both Ocado buyers and external suppliers to input media bookings correctly. Used a script to pre-populate a personalised template for each of the ~1,000 large suppliers and distribute them to supplier folders on Box.com, a secure cloud drive the suppliers already had access to.
2. **Internal rollout** — presented and demoed the system live to ~70 Ocado buyers, and produced training videos and documentation for external suppliers.
3. **Automated ingestion pipeline** — built a daily script to scrape Box for all submitted files and ingest the data into BigQuery, giving real-time reporting on what had been booked by whom.
4. **Central orchestration sheet** — built a Google Sheet that centralised every booked featured-product asset, flagged whether each booking was valid, tagged buyers, allowed buyer overrides, and automatically generated backfill placements for any unbooked slots using Tom's algorithm.
5. **Nightly API pipeline** — orchestrated a nightly process: the sheet locked at a set time, all changes were loaded into BigQuery, formatted into Citrus API payloads, and sent as API requests to create or update campaigns. API responses were recorded, spreadsheets were re-scraped, and the sheet was refreshed and unlocked for the next day.

The following year, Tom built a proof-of-concept self-serve booking platform in React and Firebase before the team decided to evaluate third-party vendor solutions; Tom contributed to the RFP process for vendor selection.

**Result:** Approximately **5,000 assets per month**, each previously requiring ~2 minutes of manual data entry, were fully automated — eliminating roughly **2,000 hours of admin work annually**. Automated validation also removed a class of costly human errors: suppliers had previously refused to pay invoices when their media failed to go live on time due to incorrect manual bookings. The system gave Ocado real-time, accurate visibility of committed media revenue for the first time.

## First-party data monetisation (£250k/year)

**Situation:** As an online-only retailer, Ocado held exceptionally rich first-party purchase data — they knew precisely what every customer was buying. This data was highly valuable to advertisers but was not yet being monetised. The commercial opportunity was to connect Ocado's customer data with a demand-side platform (DSP) called **The Trade Desk**, which links advertisers (e.g., a drinks brand) with publishers across thousands of websites, enabling precise audience targeting. The solution had to be fully GDPR-compliant: it used an internal pixel that fired on the Ocado website to map Ocado's internal customer IDs to The Trade Desk's own UUIDs — no personally identifiable information was shared at any point.

**Task:** As an analyst at the time, Tom was asked to build the pipeline infrastructure that would allow advertisers to create and run audience-targeted campaigns based on Ocado's first-party data, and to close the measurement loop by feeding campaign performance back to advertisers.

**Action:**
- **Booking interface** — built a validated spreadsheet for The Trade Desk's account managers to input campaign parameters: start and end dates, audience targeting criteria (e.g., customers who had spent more than £20 on beer in the last 6 months), and the products the advertiser was promoting.
- **Approval workflow** — set up a daily automation that notified Tom's team of new entries and triggered a manual confirmation step before any data was processed.
- **Audience pipeline** — once confirmed, the booking was ingested into BigQuery; a pipeline generated the list of matching Trade Desk UUIDs based on the targeting criteria and delivered them to The Trade Desk via their API.
- **Measurement close-loop** — extended the pipeline to also send sales data for each Trade Desk UUID against the advertiser's promoted products, so both The Trade Desk and advertisers could see how their campaigns were performing in terms of actual Ocado purchases.
- Orchestration via **Airflow**, API calls in **Python**, data transformation in **SQL** on **BigQuery**.

**Result:** The integration created a **brand-new revenue stream** worth **£250,000 annually at over 90% margin** — one of the highest-margin products in Ocado's retail media business, built from data Ocado already owned.

## Media pricing at £50m scale

**Situation:** Ocado generated approximately £70 million annually from all media assets, of which around **£50 million** came from featured products and banners. These assets were sold across more than **2,000 search clusters** (groupings of similar search terms). Historically, assets were priced in just four broad price bands, and buyers were individually discounting heavily — sometimes by over 90% — leading to significant price discrimination. Some suppliers were paying full price and receiving poor ROI; others were paying a fraction of list price and seeing strong returns. As the retail media industry matured, suppliers were beginning to demand performance data, which meant the pricing inconsistency was about to become visible and untenable. Ocado needed to move to a fair, transparent, competitive marketplace.

**Task:** Tom was asked to price each of the 2,000+ search clusters individually, using a **150% ROI delivery target as the benchmark** — i.e., set each asset's price at the level where the median booking would achieve 150% return on ad spend — and to quantify the financial risk of the transition.

**Action:** Tom built the analysis by pulling together multiple data sources: media booking data (ingested from the booking systems), buyer-enriched discount data (many bookings had no £ value recorded, so Tom worked directly with buyers to reconstruct what each discount actually was), and web analytics data to understand both the sales lift attributed to featured products and the view counts for banner placements. Using this, he calculated individual ROI-based prices for each search cluster and modelled the revenue impact — assuming suppliers would purchase the same media under the new pricing and would not tolerate price increases above 20%.

The result of this modelling was stark: moving to 150% ROI-based pricing would require such dramatic price reductions that it put approximately **£35 million of annual revenue at risk**. Tom produced this analysis at supplier, category and total level and co-presented it to senior leadership alongside a set of strategic options:

- Lowering the 150% ROI target to a more conservative benchmark
- Using the upper-quartile ROI as the pricing benchmark rather than the median
- Assuming suppliers would book more volume if their budgets were no longer exhausted by high prices (partially offsetting the revenue reduction)
- Introducing new media placements to create more inventory in high-value spaces

**Result:** Senior leadership used the analysis to agree on a **3-year pricing strategy**: gradually reducing prices toward the ROI-based benchmark while simultaneously upselling new media placements and educating suppliers on how to spread their budgets across a wider range of assets. The work directly shaped Ocado's long-term media pricing direction and demonstrated Tom's ability to produce commercially consequential analysis and communicate it credibly at senior level.

## Supplier notifications (15% revenue lift)

Tom built two layers of automated supplier communication. The first was real-time alerts triggered when a supplier's prepaid wallet was running low or a campaign was close to expiry — preventing revenue from silently draining without anyone noticing. The second was a monthly personalised report for each supplier, summarising their last month's performance and quantifying the revenue they had missed due to wallet depletion, expired campaigns, bids that were too low, or gaps in search-term coverage. The result was a **15% increase in media revenue** and overwhelmingly positive supplier feedback. Suppliers came to treat these communications as business-critical: during an API key rotation incident that temporarily stopped the emails, suppliers proactively contacted Ocado to ask where their reports were.

## Featured-product algorithm (+10% ad revenue)

Tom owned the backfill and auction-placement algorithm that determined which supplier bid won each ad slot. He improved it by incorporating **click-through rate** as a signal alongside the raw cost-per-click bid — producing better outcomes for Ocado (higher-quality, more relevant placements) and for suppliers (fairer, performance-aware competition). The result was a **10% increase in ad revenue — approximately £125,000/year**.

## Booking process, document scraping & £100m reporting

The **document-scraping technology** on Tom's CV refers to the same validated-spreadsheet and Box-scraping system described in the Ad-tech API integration section above. To clarify how it powered the £100m reporting figure: each of the ~1,000 supplier spreadsheets stored in Box contained rows representing individual booked media assets. Tom's Python script — using the Box SDK — scraped every file daily and ingested the data into BigQuery. This data served three distinct use cases simultaneously:

1. **Operational** — automated campaign creation and updates in Citrus (the ad-tech platform), as described above.
2. **Revenue reporting** — gave the business a real-time view of committed media spend per supplier, tracking whether Ocado was on target to meet annual agreements. This was the foundation for reliable reporting of **£100 million in total media revenue** (featured products, banners, and all other media assets combined).
3. **Central buyer visibility** — a single view for all ~70 buyers showing which assets had been booked, whether each had gone live, any errors on the booking, and the ability to overwrite entries.

The script was initially scheduled on a virtual machine and later productionised into an **Airflow DAG**. Tom also standardised the media booking process end to end and trained the buying teams on the new workflow.

## Data feeds, SME role and teaching

- Established and managed critical data feeds pivotal to the media monetisation strategy.
- Acted as the subject-matter expert for media-related data to both internal and external stakeholders.
- Led training sessions for analysts in advanced SQL and process optimisation, fostering a culture of continuous improvement.
