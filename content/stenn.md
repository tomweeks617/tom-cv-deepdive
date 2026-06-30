# Stenn Technologies — Analytics Engineer (April 2024 – December 2024)

Stenn Technologies was a global fintech start-up. Tom worked there as an Analytics Engineer for nine months in 2024.

**Important context:** the role concluded in December 2024 because **the company entered administration**. This was a company-level event, not a reflection on Tom's performance. If asked why the role was short, that is the answer.

## Marketing attribution at $6m scale

**Situation:** When Tom joined Stenn, the sales and marketing data estate was in poor shape. Salesforce was being incorrectly populated, the product-to-Salesforce integration was not passing all fields correctly, and not all data was being ingested into Snowflake. In practice this meant there was no way to identify which campaigns running on Google, Meta, LinkedIn or Reddit were generating leads, which of those leads were converting to opportunities, or how far those opportunities were progressing down the sales funnel — all with a $6 million paid-search budget in flight.

**Task:** Tom was introduced to the VP of Digital Marketing, who requested a multi-touch attribution model to understand which campaigns were performing and which were not.

**Action:** Tom assessed the data estate and quickly concluded that multi-touch attribution was several steps away given the data quality gaps. Rather than accepting the brief at face value, he went back to the VP with two options: (1) attempt the full multi-touch model in one go, with a risk of several months of delays and technical blockers, or (2) his recommended approach — work iteratively, delivering immediate value while building toward the end goal. The VP agreed. Tom then ran three parallel workstreams:

1. **Data quality** — ran a workshop with the Revenue Operations and Sales teams to audit and clean up Salesforce data, and ensured UTM parameters were being correctly passed from ad campaigns through to Salesforce leads.
2. **Data and analytics engineering** — used dbt to build all the underlying data models, with testing, alerting and orchestration, plus in-progress Looker explores for the marketing team to use.
3. **Attribution modelling** — worked with Revenue Operations to design attribution logic. Started with last-touch attribution as a reliable, fast-to-ship foundation, with a clear plan to evolve to multi-touch attribution once the data quality workstream had resolved the upstream issues.

Throughout, Tom ran regular update sessions with all relevant teams and delivered training on how to use the Looker explores as they were built.

**Result:** Actionable campaign-performance insights were available within **two weeks** — far ahead of the original timeline expectations. These were used immediately to optimise paid-media spend allocation across Google, Meta, LinkedIn and Reddit. Six months later, the models had matured into precise, reliable multi-touch reporting that gave the marketing team a clear view of which campaigns were driving each stage of the sales funnel — enabling disciplined optimisation of the **$6 million paid-search budget**.

## Early AI email personalisation (35% CTR lift)

**Situation:** Stenn's CTO set a company-level goal of reaching one million potential customers via outbound email. The team was already building and enriching a large contact database, so there was extensive data available on both the individual and the company they worked for. At the time (2024), commercial tools for AI-driven email personalisation at this scale did not yet exist.

**Task:** Tom proposed using this contact data to hyper-personalise outbound emails using AI — pitching it as a hackathon project. The VP of Data liked the idea and partnered with Tom to build it.

**Action:** Tom and the VP of Data used **Cortex in Snowflake** to generate personalised email subjects and bodies, feeding in the individual and company-level data from the contact database. Through iteration during the hackathon they reached a point where the emails were highly personalised and genuinely engaging — enough to demo to the CTO. The team then trialled the AI-generated emails against a random sample of generic emails and measured the click-through rate difference.

**Result:** The AI-personalised emails delivered a **35% higher click-through rate** than generic equivalents. The CTO was impressed with the demo. Unfortunately, Stenn Technologies entered administration before the product could be fully productionised and scaled to the million-contact goal. The project nonetheless demonstrated a clear proof of concept: data-rich AI personalisation can drive material uplift in outbound marketing performance, and the approach was ahead of what was commercially available at the time.

## Pipeline ownership and dbt craftsmanship

- Owned Marketing data pipelines end to end: ELT, reverse ETL, data quality management and data governance.
- Refactored complex dbt models to adopt best practices and introduced more comprehensive dbt testing — inherited models were made maintainable and trustworthy.

## Enabling self-serve analytics

Tom built and maintained Looker explores and dashboards, and ran Looker training sessions for the wider business so that users could self-serve their own analytics instead of queueing requests on the data team.
