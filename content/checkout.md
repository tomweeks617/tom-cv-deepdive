# Checkout.com — Analytics Engineer II (February 2025 – present)

Checkout.com is a global payments platform serving enterprise merchants worldwide. Tom joined in February 2025 as Analytics Engineer II and owns the architecture, reliability and roadmap of multiple production analytics products. These products serve two audiences: internal teams and — unusually for an analytics engineering role — **external enterprise merchants**, which raises the bar on reliability, latency and polish.

## Partition-pruning framework (~25% pipeline cost reduction, £175k savings)

Tom designed and rolled out an **opt-in DML partition-pruning framework for dbt-bigquery** across Checkout.com's analytics engineering estate. The framework resulted in a **~25% reduction in pipeline compute costs** for the project, equivalent to **£175k in annualised savings**. A further **£50k of annual savings** is forecast as adoption spreads.

- Situation
Having migrated from Snowflake to BigQuery, and despite the overall pipeline cost reducing, I noticed that a significant amount of cost/slot-ms was being consumed by DML mutation jobs (merge, update, and delete). For context, when dbt incremental models run, they typically spin up two jobs: one to process the new batch of data into a temporary table, and one to merge that temporary table into the target table. Surprisingly, it was the latter mutation job where almost all the cost was going.

- Task
I investigated by analysing the query plan of these jobs and realised that the cost was dominated by scanning the target tables. From the job metadata, I could verify that these jobs were scanning the entire table. Some of our tables are >100TB, so it was clear that partition pruning was not being applied.

During the migration, our assumption was that defining the partitioned field in the unique key — e.g., `unique_key = [payment_id, requested_at]` — would apply pruning, as the merge operation would join on `src.requested_at = tgt.requested_at`; at least this is what had been happening in Snowflake. However, BigQuery's documentation states that BigQuery requires constant expressions to apply partition pruning.

From this, the fix was clear: find a method of applying pruning using constant expressions at query time.

- Action
The immediate thought was to use dbt's built-in solution, `incremental_predicates`. However, this did not work for the following reasons:
1. We have unpredictable late-arriving data where records that are years old can be updated with new events such as disputes and refunds, so a fixed lookback window is not suitable.
2. Incremental predicates simply injects compiled code into the merge condition without resolving it as a constant, so even if I defined the predicate with a SQL expression — e.g., the distinct partitions present in the temporary table — BigQuery would still not be able to prune.

The solution was therefore a custom one: intercept the dbt merge command between when the temporary table is built and when the merge operation runs, resolve the distinct partition field values, and inject them as constants into the merge SQL.

This was achieved by overriding the dbt-bigquery adapter's `bq_generate_incremental_merge_build_sql` macro ([source](https://github.com/dbt-labs/dbt-bigquery/blob/0995665e490cdee9c408d26aac8e1c19fefaebe0/dbt/include/bigquery/macros/materializations/incremental.sql#L62)) by redefining it in our local dbt project. The new macro mirrored dbt's original but ran a series of macros to query the temporary table for its distinct partition values and compile them as constants into the merge job.

Once set up, models require a one-line config change to opt in. After extending this framework to cover update and delete operations, I packaged it and shared it with other teams, accompanied by a Claude plugin that sets up the macro in their own project, installs the package, and identifies candidate models.

- Result
In our payment lifecycle pipeline alone, BigQuery costs dropped by ~25%, equivalent to ~£175k per year. Around 25 models in total were configured with this pruning mechanism, some of which saw their dbt run cost reduce by ~95%.

I ran a knowledge-sharing session at Checkout demonstrating this work, and other teams are currently planning to implement the framework using the package. I've paired this with a Claude plugin that helps with setup and identifies candidate models for dynamic DML pruning. I forecast an additional £50k per year of savings across all other dbt projects at Checkout.com.

- Current limitations
1. The partitioned field must be immutable; otherwise there is a risk that a changed partition value will be excluded from the merge update condition, causing the record to be inserted into the target table as a duplicate.
2. For incremental merge models, `on_schema_change` cannot equal `'ignore'` as dbt-bigquery does not create a temporary table in these cases and instead combines the new batch processing and the mutation operation into a single BigQuery job.

- Trade-offs
The main trade-off is a small amount of maintenance required when upgrading dbt versions, as the pruning framework requires the `bq_generate_incremental_merge_build_sql` macro to be shimmed in each dbt project.

- Future builds
1. Provide methods to relax the immutability constraint — e.g., maintain a lightweight lookup table mapping each primary key to its current partitioned field value in the target table.
2. Extend the method to improve read performance by storing partition field metadata in lightweight lookup tables.

Key aspects of the framework:
- **Opt-in DML approach**: targets the most expensive models in the estate — those that cannot be fully partition-pruned with standard incremental strategies — and applies fine-grained DML to allow BigQuery to prune partitions precisely rather than scanning unnecessary data.
- **Claude plugin for ease of setup**: Tom packaged the framework alongside a Claude plugin that guides engineers through configuring it correctly, lowering the barrier to adoption and reducing the risk of misconfiguration.
- **Company-wide distribution**: the framework was published internally and distributed across the analytics engineering organisation, with Tom leading knowledge-sharing sessions on partition pruning.

---

## BigQuery table enrichment (250TB / 25bn-row table)

Situation
We model the lifecycle of all payments that Checkout processes. Authentication is an early stage of the payment lifecycle and its source of truth is the Authentication service at Checkout. We were inferring authentication attributes of the payment from payment data produced by the source of truth for payment requests. This caused two problems:
1. Poor data correctness: the inferences made were not 100% reliable and were often a best guess at what happened during Authentication.
2. We were missing many authentication data points that are important for understanding how authentication impacts authorisation rates — e.g., quantifying how much certain authentication experiences affect the probability of a successful authorisation.

Task
Authentication payment-lifecycle requirements needed to be gathered across a number of stakeholders, including a financial director, Authentication product managers, merchant-facing Dashboard product managers and engineers, downstream analytics engineers, product data scientists, and payment specialists. The goal was then to enrich our payment lifecycle model with Authentication-sourced data.

Action
After requirements were gathered, they were modelled into user stories that challenged the importance of each requirement. Each user story was assessed for feasibility and a proposal was made for each, which was then shared with the relevant stakeholders to reach agreement.

The next stage was to document the new schema, including new definitions, metrics, and tests. This was shared with the other analytics engineers who managed the payment lifecycle so that the proposal could be challenged.

Following agreement, a PoC was deployed into a mirror of our payment lifecycle model with a 2-day retention to keep costs down. This could then be reviewed for data correctness by stakeholders.

A technical design was shared with other analytics engineers for them to challenge and agree on decisions. The key technical challenges in this project were:

1. **How to accurately link authentications to payments.** Some payments can trigger or involve multiple authentication sessions, and it is not always clear which session authenticates the payment and is subsequently passed on during authorisation. This required coordination between the Authentication and Gateway teams as well as payment specialists to understand how to replicate operational logic within dbt. Nuanced logic was applied depending on the authentication experience, session result, region, and scheme. dbt tests were set up to maintain confidence and observability that this logic matches the operational behaviour, with a dbt test confirming that all sessions are captured in the join on each run.

2. **How to make the enrichment cost-effective against a 250TB table.** Two approaches were considered: (i) an on-the-fly join within the merge model, or (ii) enrichment via a separate update statement using the DML partition-pruning framework described above.

   - On-the-fly join: the simplest solution to implement. Typical payment batches were between 10 and 50GB; joining these against a 10TB authentication source required a time-bounded filter on the authentication data. Authentication engineers confirmed that an authentication session can occur at most 2 hours before and after the payment request, making a fixed lookback viable for all cases.
   - Update enrichment: more complex to implement. Pros: highly efficient when paired with DML partition pruning, and handles long-tail late-arriving data well. Cons: not atomic with the payment lifecycle's merge — the update runs after the merge, meaning there is a brief window where a row can be fresh for non-authentication fields but stale for authentication fields.

   **Decision:** use the on-the-fly join within the merge model, as authentication sessions are short-lived and occur within a predictable timespan of the payment request, making the time-bounded filter reliable.

3. **How to ensure data correctness when joining two sources.** dbt tests were set up to monitor for conflating data points across sources. Some fields conflate by design — e.g., JSON fields that were not unpacked, enriched, and repacked due to cost. For these fields, the discrepancies were transparently documented and communicated on release.

Result
90% of stakeholder user stories were delivered; the remaining 10% were deprioritised due to a low impact-to-cost ratio. This enabled:
1. Downstream analytics engineers and data scientists no longer needed to model their own custom joins to Authentication, which centralised the join logic and reduced the overall compute cost of running heavy joins across multiple models.
2. Unlocked the ability to easily monitor how authentication impacts authorisation performance, enabling Checkout to make more informed decisions about how to optimise KPIs such as acceptance rates.
3. Allowed us to report to merchants how much money could be saved by enabling liability shifts for qualifying payments.
4. Served as the precursor for performing this enrichment upstream in Flink streaming.

Tom enriched a **250TB / 25bn-row BigQuery table** — one of Checkout.com's largest source datasets — with approximately **~10TB of source-of-truth data**. The enriched table is kept up-to-date via a **bihourly pipeline**, eliminating the need for costly ad-hoc multi-terabyte joins that downstream teams had previously been running. The result was improved data correctness and a significant reduction in the compute cost of downstream queries that had previously had to join in the missing data at query time.

---

## Snowflake → BigQuery migration (~30% cost saving)

### Why the migration happened

After a long-running Snowflake contract, the commercial costs had become very expensive. Following a POC, BigQuery proved to be considerably cheaper — material savings given that some tables Checkout.com operates are in the **hundreds of terabytes**. At that scale, cost-effective compute and storage is essential. The company-wide migration followed. Tom's team's migrated products contributed to an overall **~30% cost saving** while maintaining platform performance and reliability.

### Tom's team went first

Tom's team — Payment Analytics — is a central analytics team responsible for the largest data products at Checkout.com. Because of this, they were the **first team to undergo the migration**, which meant they had to invent the migration strategy from scratch for the rest of the business to replicate. There was no playbook to follow.

### Why it was high stakes

The products being migrated are business-critical. Failure to maintain 100% accuracy and zero downtime could result in:
- **Regulatory fines** for Checkout.com
- **Operating licence suspensions**

This is not typical analytics engineering risk. The bar for correctness and reliability was equivalent to a production systems migration.

### Key technical challenges

**1. Zero-downtime migration at scale**
Data volumes were so large that some models cannot be fully refreshed. Many had to be processed in batches — including backfills run in 6-month chunks for the largest tables.

**2. Copying historic source data**
Hundreds of terabytes of historic source data had to be copied from Snowflake to BigQuery before incremental pipelines could take over.

**3. BigQuery metadata limitations**
BigQuery (at the time of migration) did not store column-level or partition-level statistics. In Snowflake, a query like `max(updated_at)` on a non-clustered field is free because the result is stored in table metadata. In BigQuery, the same query scans the full column.

Tom's team solved this by **building dbt macros that executed as post-hooks**, writing metadata into a purpose-built metadata table so that downstream queries could reference pre-computed statistics rather than scanning large columns.

**4. Complex data structures**
Snowflake represents complex nested data as repeated JSON objects. BigQuery's JSON storage and evaluation proved very costly at scale. Tom's team migrated these to **STRUCTS**, which are more rigid but far more efficient.

**5. Looker query costs**
Looker costs were initially very high because querying large tables for specific merchant IDs — even with partition pruning — was expensive. The solution was to enable **fine-grained DML** on these tables, which allows more optimised partition chunking when individual IDs are queried. The trade-off: this feature was in beta at the time, and **time travel is not available on fine-grained DML tables**.

### What Tom migrated

- Authentication fact data product
- Alternative Payment Methods (APMs) fact data product
- Vault Instrument fact data product (>10 TB of data)
- Dimensional models
- Imply (Apache Druid) pipelines and underlying data
- All Payment Analytics lower-environment (non-production) models

Tom maintained **100% uptime and data correctness** across all migrated products throughout.

### The migration method

The approach evolved over time but broadly followed this sequence:

1. For APMs: worked with Data Platform to set up a Flink job micro-batching source data from a Kafka topic into BigQuery. For all other products: worked with source data owners to confirm correct ingestion into BigQuery via their own Flink jobs, FiveTran, Qlik, spreadsheets, etc.
2. Established a cutoff date for when each new BigQuery source went live.
3. Copied source data from Snowflake to GCS using a process defined by the Data Platform team.
4. Built the dbt models in BigQuery and tested locally.
5. Ran a full refresh against a small window of data in BigQuery.
6. Configured a DAG to use AWS DataSync to copy the data product data from Snowflake to BigQuery, then ran primary-key-level validation across all fields.
7. Investigated discrepancies — either fixing them or documenting the expected difference.
8. Iterated until confident the models were working correctly on small-window full refreshes.
9. Orchestrated the BigQuery models to run bi-hourly in a DAG.
10. Configured a second DAG to copy incrementals from Snowflake to BigQuery via DataSync and validate the data.
11. Iterated on models until the validation DAG was consistently passing.
12. Backfilled a larger window, ran the incremental for several days, and confirmed the validation DAG continued to pass.
13. Backfilled the full tables. For large models, backfills were batched in 6-month chunks.
14. Continued running the validation DAG across the backfilled data.
15. Fully documented the validation and obtained sign-off from data stewards and downstream users confirming the BigQuery products were ready.
16. Communicated a cutoff date to all users — the date from which Snowflake would stop updating and BigQuery would be the live source.

---

## Claude plugin — Imply pipeline automation

### Context: what Imply is

Checkout.com uses Imply — an Apache Druid service provider — to power its proprietary **merchant-facing analytics dashboard**, enabling merchants to receive insights with subsecond query response times. Imply does not support updates at scale, so data must be loaded incrementally using a pattern of negations and reinsertions.

To keep costs reasonable, only **aggregated data** is sent to Imply. In dbt, this is aggregated to hourly level across a number of dimensions. The pipeline:

1. An incremental dbt model identifies changed records, negates them, and reinserts updated aggregated records into BigQuery.
2. Both the negations and additions are loaded to GCS, then on to Imply.
3. The Imply API manages ingestion jobs.
4. Validation queries run against internal data products to confirm correctness.
5. The whole process is orchestrated in a DAG.

### Why new feature development was slow

The complexity of this pipeline meant that adding new features — new dimensions, new metrics, new aggregations — was difficult and very time consuming. Each change required careful coordination across the dbt models, the incremental logic, GCS export, Imply ingestion, and validation.

### What Tom built

Tom built a **Claude plugin** — a set of Claude scripts and skills — that automated the most complex and repetitive parts of this workflow. The plugin supports:

- **End-to-end pipeline creation from scratch**: takes a dbt model, a list of dimensions and metrics, and the required level of aggregation as parameters, and builds the full pipeline.
- **Adding new fields to an existing table**: develops a new version of the existing models and Imply tables with the additions, and plans out a **blue/green deployment strategy**.
- **Running queries against Imply tables** and returning the responses.
- **Comparing schemas** across Imply tables.
- **Validating Imply tables against BigQuery** tables.
- **Estimating the cost of pipeline changes** — particularly important given these are among the most expensive models in the estate.

Tom shared this as a plugin across the entire analytics team, giving analytics engineers a tool to build and extend the Imply pipeline without needing to deeply understand the underlying complexity.

---

## Merchant-facing analytics (5× insight coverage, Forrester 5/5)

Tom designed and delivered scalable analytics pipelines that increased merchant-facing insight coverage by **5×**, significantly expanding low-latency self-service reporting capabilities for enterprise customers. This work played a key role in Checkout.com achieving an **industry-leading 5/5 Forrester Wave score for "Data, Analytics & Insights" in 2026 Q1** — external validation that the merchant analytics capability is best-in-class in the payments industry.

Situation:
Checkout.com's proprietary merchant-facing Dashboard provides enterprise merchants with insights into their payment performance. At the time, the Analytics section had limited coverage — merchants could see basic payment volume and acceptance rate data, but lacked granular visibility into what was driving their performance. Expanding this coverage was a key commercial priority: richer merchant analytics is both a competitive differentiator and a direct driver of merchant adoption and stickiness.

The technical constraint is that all insights served on Dashboard must come from Imply (the Apache Druid serving layer described in the section above) to meet the sub-second response time requirement. Every new insight therefore requires end-to-end pipeline work: dbt modelling, integration with the Imply pipeline, and coordination with Dashboard software engineers to surface the data in the product.

Action:
Expanding insight coverage required iterating on the dbt hourly aggregation models and the Imply pipeline to introduce new insight categories, working closely with the Dashboard PM and software engineers throughout. The key developments delivered were:

**Authentication insights**
Authentication data was surfaced in Dashboard, giving merchants visibility into how their authentication experiences (3DS, exemptions, etc.) affect their downstream authorisation performance.

**Event-level insights**
Event-level payment data was exposed in Dashboard, providing merchants with granular visibility into individual payment events rather than only aggregated summaries.

**Sample payment IDs for drill-down troubleshooting**
Sample payment IDs were exposed in Imply, allowing merchants to navigate from an aggregated insight directly to specific failing payments for troubleshooting. This is particularly valuable for diagnosing spikes in declines or authentication failures.

**Recurring payment authorisation insights**
This was the most technically complex development. Complex dbt models were built to identify whether Checkout had previously processed a payment in a recurring payment or subscription series. This enabled:
1. A Dashboard insight comparing authorisation rates for payments where Checkout has previously seen the payment (an earlier payment in the same subscription) against payments where Checkout is seeing the transaction for the first time.
2. A compelling commercial story: authorisation rates are almost always materially higher when Checkout has prior transaction history, because card networks and issuers are more likely to approve transactions through a familiar network path. This gives merchants a direct incentive to route all their payment traffic through Checkout rather than splitting volume across multiple acquirers.

**Looker-style explorer in Dashboard**
A self-serve exploration tool was built into Dashboard, connected directly to data in Imply, giving merchants sub-second ad-hoc analysis capability beyond the pre-built insight pages.

**AI assistant data models**
Product and MCC (Merchant Category Code) usage models were built in BigQuery and provided to the AI assistant embedded in Dashboard, powering its conversational analytics experience.

**Claude plugin enabling broader contribution**
The Claude plugin built for the Imply pipeline (described in the Apache Druid section) was central to scaling delivery. It allowed other analytics engineers to build and extend Imply pipelines without needing deep domain knowledge of the negation-append pattern. This enabled other team members to independently deliver fraud and card payout insights to Dashboard.

Result:
Merchant-facing insight coverage increased by **5×** across the Dashboard Analytics and explorer experiences. The breadth and quality of the analytics offering contributed to Checkout.com achieving a **5/5 Forrester Wave score for "Data, Analytics & Insights" in Q1 2026** — the highest possible score and an independent validation that the merchant analytics capability is best-in-class in the payments industry. The Claude plugin also unlocked contributions from other analytics engineers, with fraud and card payout insights subsequently delivered by other team members.

---

## Apache Druid partnership ownership

Tom is the technical owner and subject-matter expert for Checkout.com's partnership with Imply (the Apache Druid service provider). He drives adoption internally, manages vendor engagement, and is accountable for production reliability of the Druid-backed systems. Druid underpins the low-latency analytics serving layer for the merchant-facing dashboard.

Situation:
Our proprietary merchant-facing dashboard contains Analytics pages and a Looker-style explorer. The expectation from clients is that query latency is very low — any element on these pages should have a sub-second response time. This requires a performant query engine; for this we use Imply, an Apache Druid service provider.

Due to our high data volumes, we mostly serve aggregated data via Imply. To do this, we have a pipeline that aggregates our data products to an hourly grain, loads the batch to GCS, syncs the data to S3, then calls the Imply API to load the batch from S3 into Imply. (GCS to S3 is necessary as Imply does not support GCS or BigQuery as a data source.) The complication is that Imply does not allow records to be updated; we can either append data or rewrite entire partitions.

Rewriting entire partitions is not feasible due to large data volumes, so we append data. The challenge is that when payment states change, we need to negate a record that already exists in Imply and reinsert the updated aggregation. Imply then compacts on their end.

This negation pattern leads to costly dbt models and a highly fragile data pipeline. As this data is merchant-facing, it has 24/7 support.

I have acted as the technical owner of this pipeline, its developments, and the relationship with Imply. This has entailed designing and delivering new models and extensions of existing models to deliver more insights on Dashboard, improving the robustness of the pipeline, monitoring ingestion and query performance, raising support tickets, and holding monthly touchpoints with Imply. More recently, this has involved running a vendor analysis and beginning a PoC evaluating BI Engine as a replacement.

Challenges:
1. The dbt models required to perform these negations are expensive. They require long lookback periods, complex self-joins, and unnesting of complex data structures.
2. The pipeline is fragile. Many stages — including loading data into Imply via the API — are not idempotent, so transient errors need to be investigated carefully.
3. New developments require significant engineering effort. Building a pipeline that populates data in Imply requires substantial analytics engineering effort, software engineering effort to connect the Imply write to Dashboard, and comprehensive observability and monitoring.
4. Imply has some fundamental flaws:
   - Couples compute and storage resources, meaning new data releases run on the same compute as production.
   - Does not support GCS or BigQuery as data sources, requiring a data sync to S3 and incurring egress costs.
   - Does not support updates, requiring a convoluted and fragile append-only pipeline.
   - Query performance can degrade during peak Dashboard usage hours when running tests against production data or when merchants are running particularly heavy queries.

Actions:
1. I optimised our most expensive dbt model powering the Imply pipeline by running an investigation into optimisation opportunities and presenting the team with a list of six optimisations with the trade-off for each. These included using Numeric instead of BigNumeric data types, pre-aggregating data, and applying filters to exclude the long tail of late-arriving data at the cost of some precision (acceptable, as this is aggregated data). The only recommendation not applied was replacing a JSON object with repeated STRUCTs in BigQuery, which would have likely saved an additional ~£15k per year but required significant upstream refactoring.

Result: ~40% cost reduction (~£40k/year).

2. To improve the robustness of the pipeline:
   - Documented the pipeline and produced incident recovery guidance for both engineers and AI agents.
   - Our alignment tests between Imply and our data products were generating false-positive alerts, often due to a timing issue: our first run of the day waits for FX rates to populate before starting, which can delay the data product update relative to when the alignment test runs against Imply. I fixed this by querying the data product using time travel at the point when the last batch pipeline completed, which completely eliminated false-positive alerting from alignment tests.
   - Another cause of incidents was transient API 5xx errors when initiating a new batch job. Sometimes the batch had loaded into Imply; sometimes it had failed. Due to the non-idempotent nature of append-only batches, blind automatic retries were not safe, so I routed retries through logic that checked whether a recent batch had been or was currently running. This significantly reduced out-of-hours alerting.

3. I developed a Claude plugin that allows users to quickly build the dbt models with complex negation logic and comprehensively test them before production release. This sped up development significantly and allowed other team members to contribute to merchant Dashboard developments without needing to fully understand Imply and the pipeline.

4. The fundamental flaws in Imply were formally recognised across stakeholders following a vendor landscape analysis I presented, which made the case for exploring alternatives. The analysis was compelling enough to secure agreement to run a PoC evaluating Google BI Engine as a replacement serving layer — a tighter fit with our BigQuery estate that would eliminate the GCS-to-S3 sync, decouple compute from storage, and remove the append-only constraint. The PoC is currently in progress.

---

## Operational ownership and 24/7 support

### The stakes

Payment Analytics owns core, critical models with strict SLAs for both latency and data accuracy. These models feed:

**Internally:**
- More than **2,000 internal users** rely on this data to drive decision-making across the business.
- Machine learning models used for operational use cases.

**Externally:**
- Merchant and client insights and operational reporting.
- **Regulatory reporting** — one of the highest-stakes downstream uses.

If these tables were to breach SLAs, the consequences could include severe reputational and financial damage, large regulatory fines, and even operating licence removals. This is not a typical analytics context.

### Tom's on-call role

Tom participates in the 24/7 support rota and is the **sole escalation point** for critical analytics systems during his on-call shifts. His responsibilities when an incident occurs:

1. **Identify the impact** of the issue and communicate it clearly to stakeholders.
2. **Identify the root cause**.
3. If the root cause is owned by the Payment Analytics team: **solutionise and resolve**.
4. If owned by another team: **escalate** to the responsible owners with full context.

### Data product ownership

Beyond on-call, Tom is the named data product owner for three of Checkout.com's core analytics data products:

- **Merchant-facing data product** — the suite of aggregated data assets that power the merchant Dashboard, including the Imply pipeline and all downstream Dashboard analytics.
- **Authentication data product** — the source-of-truth enrichment of the payment lifecycle with Authentication-sourced data (described in detail in the BigQuery table enrichment section above).
- **Vault Instrument data product** — a >10TB data product covering vault and stored instrument data.

Data product ownership means Tom is the primary point of contact for anything touching these products: incident recovery, ad-hoc data queries from stakeholders, roadmap planning, schema change decisions, and onboarding new consumers. It is a broader accountability than on-call — it covers the full lifecycle of the product, not just break-fix.

---

## Shaping team practices

Tom partnered with another analytics engineer to establish development standards for the Payment Analytics team, then packaged these into a **Claude plugin distributed across the analytics engineering organisation** and presented at a knowledge-sharing session.

The plugin covers two categories of functionality:

**Development standards**
A codified set of analytics engineering best practices and conventions for the team, covering dbt patterns, naming conventions, testing standards, and documentation expectations. Having a shared plugin means engineers can apply standards consistently without needing to internalise every convention individually.

**Productivity and operational skills**
Beyond standards, the plugin includes a set of practical day-to-day skills for analytics engineers:
- **BigQuery cost monitoring** — surfaces cost and slot usage information to help engineers understand the impact of their models.
- **CI monitoring** — checks the status of CI pipelines and surfaces failures directly.
- **GitHub Actions workflow running** — triggers and monitors GitHub Actions workflows without leaving the development context.
- **Incident triage** — given an incident, the skill investigates root cause by analysing Cloud Composer logs and BigQuery job history, reducing the time from alert to diagnosis.

Tom also led knowledge-sharing sessions on partition pruning and Imply/Druid for the wider analytics engineering team, and has interviewed Analytics Engineer candidates.
