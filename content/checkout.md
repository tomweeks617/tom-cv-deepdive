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

This was achieved by overriding the dbt-bigquery adapter's `bq_generate_incremental_merge_build_sql` macro by redefining it in our local dbt project. The new macro mirrored dbt's original but ran a series of macros to query the temporary table for its distinct partition values and compile them as constants into the merge job.

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

---

## Apache Druid partnership ownership

Tom is the technical owner and subject-matter expert for Checkout.com's partnership with Imply (the Apache Druid service provider). He drives adoption internally, manages vendor engagement, and is accountable for production reliability of the Druid-backed systems. Druid underpins the low-latency analytics serving layer for the merchant-facing dashboard.

Situation:
Our proprietry merhcnat facing dashboard contains Analytics pages and a 'Looker style explorer'. The expectations from our clients is that query latency is very low for these insights and we aim that any element in these pages should have a sub-second response time. This requires a performant query engine; for this we have use Imply, an Apache Druid service provider.

Due to our high data volumes, we mostly serve aggregated data via Imply. To do this, we have a pipelne that aggregates our data products to an hourly grain, loads the batch to GCS, data syncs to S3, before calling the Imply API to load the batch of data from S3 to Imply. (GCS to S3 is necessary as Imply does not support GCS/BigQuery as a data source). The complication is that Imply does not allow for records to be updated; we can either append data or rewrite entire partitons.

Rewriting entire partitions is not feesible due to large data volumes so we append data. The challenge comes as we when payments state change, we need to negate a record that exists in Imply then reinsert the updated aggregation into Imply. Imply then compacts on their end.

This negation leads itself to costly dbt models and a highly fragile data pipeline. As this data is merchant-facing, it has 24/7 support. 

I have acted as the technical owner of this pipeline, it's developments, and the relationship with Imply. This has entailed designing and delivering new models/entensions of existing models to deliver more insights on Dashboard, improving the robustness of the pipeline, montioring the ingestion and query performance of Imply, rasing support tickets, and holding monthly touch points with Imply. More recently, this has involved running a vendor analysis and I have began the work to PoC BI Engine as a replacement.

Challenges:
1. As mentioned above, the dbt models required to perform these negations are expensive. They require long lookback periods, complex self-joins and unnesting of complex data structures to run.
2. The pipeline is fragile. Many stages of the pipeline including loading data into Imply via the API is not idempotent so transient errors need to be investigated seriously.
3. Developments require a lot of engineering effort. It requires a lot of analytical engineering effort to get a pipeline populating data in Imply, a lot of montioring, software engineering effort to connect the write against Imply to Dashboard, and a lot of observability/monitoring in place.
4. Imply has some fundamental flaws:
i) Couples compute and storage resources meaning that new data releases run on the same compute as production.
ii) Does not support GCS or BigQuery as data sources which requires us to data sync to S3 incuring a egress cost while doing this.
iii) Imply does not support updates meaning that we need to run a convoluted and fragile append-only pipeline.
iv) Query performance can degrade during peak Dashboard usage hours, while running tests against production data, if merchants are runnnig particularly heavy queries.

Actions for each challenge:
1. I optimsed our most expensive dbt model that powered the Imply pipeline by first running an investigation into opportunities to optimise these models and presenting back to the team a list of 6 optimisations and the trade-off for each one. These included using Numeric data types instead of bignumeric, pre-aggregating data, applying filters to exclude the long-tail of late-arriving data at the cost of accuracy (note, as this is aggregated data, total precision was less important). The only recommendation that did not get applied was to replace a JSON object with repeated STRUCTS in BigQuery. This would have likely saved another $15k a year but would have required significant upstream refactoring.

Result: decreased costs by ~40% (£40k/year)

2. To improve the robustness of the pipeline I did the followiing:
i) Documented the pipeline and provided incident recovery documentation guidence for both humans and for AI agents to utilise.
ii) Our alignment tests between Imply and our Data Products of fail with false-positive alerts. THis can be very annoying for out of hours support. These alignment failures often happen due to a timing issue where our first run of the day waits for fx rates to populate before starting which can cause delays between when the data product updates and when the alignment test runs against Imply. To fix this, I added a method to query the data product using timetravel at the point when the last batch pipeline completed. This completely removed false-positive alterting from alignment tests.
iii) Another cause of incidents were transient API (5xx) error when initiating a new batch job. Sometimes, the batch would have been loaded into Imply and sometimes it would have failed but due to the non-idempotent nature of append-only batches, we could not blindly allow for auto-matic retires so I routed retires though logic that checked whether a recent batch had or was running. This significant reduced alerting.
3. I developed a Claude Plugin that allowed users to quickly build the dbt models wiht complext negation logic in and would comphrensively test these models before production release. This speed up develepoment hugely, and allowed for other team member to contribute to merchant Dashboard developments without needing to thoroughly and completely undertand Imply and the pipeline.
4. These are fundamental flaws in the vendor that we use. Some are being addressed in their roadmap, others aren't. I have been a strong advocate for exploring alternative vendors and recently performded a vendor landscape analysis of other possible vendors, after presenting this to stakeholders, we have chosen to PoC BI Engine and I am currently leading this PoC.



Tom is currently leading a **proof of concept evaluating migration from Imply/Druid to Google BI Engine** as an alternative serving layer. The goals are to improve reliability and increase engineering velocity — Google BI Engine's tighter integration with BigQuery would reduce the operational overhead that currently comes with managing a separate Druid cluster.

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
