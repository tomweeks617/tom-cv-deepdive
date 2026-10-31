# Checkout.com — Analytics Engineer II (February 2025 – present)

Checkout.com is a global payments platform serving enterprise merchants worldwide. Tom joined in February 2025 as Analytics Engineer II and owns the architecture, reliability and roadmap of multiple production analytics products. These products serve two audiences: internal teams and — unusually for an analytics engineering role — **external enterprise merchants**, which raises the bar on reliability, latency and polish.

## Partition-pruning framework (~25% pipeline cost reduction, £175k savings)

Tom designed and rolled out an **opt-in DML partition-pruning framework for dbt-bigquery** across Checkout.com's analytics engineering estate. The framework resulted in a **~25% reduction in pipeline compute costs** for the project, equivalent to **£175k in annualised savings**. A further **£50k of annual savings** is forecast as adoption spreads.

- Situation
Hvaing migrated from Snowflake to BigQuery, and despite overall pipeline cost reducing, I noticed that a significant amount of cost/slot-ms was taken up our DML mutation jobs (merge, update, and delete). For context, when dbt incremental models run, they typically spin up 2 jobs; one to process the new batch of data into a temporary table, and one to merge that temporary table into the target table. Suprisingly, it was the latter mutation job where all the cost was going. 
- Task
I wanted to investigate what was going on so I analysed the query plan of these jobs and relised that the cost was dominated by scanning the target tables. From the job metadata, I could then verify tha that these jobs were scannig the entire table. Some of our tables are >100TB so it clear that pruning was not being applied. 

During the migration, our assumption was that defining the partioned field in the unique key e.g., unique_key = [payment_id, requested_at] would apply pruning as the merge operation would join on src.requested_at = tgt.requested_at; at least this is what was happening in Snowflake. However, the Google's BigQUery documentation states that BigQuery requires constant experssions to apply pruning.

From this, the fix was clear: identify a method of pruning with constant experssions at query time.
- Action
The immediate thought was to use dbt's built in solution, incremental_predicates. However, this did not work for the following reasons:
1. We have unpredicatable late-arriiving data were records that are years old can be updated with new events such as disputes and refunds. So a fixed lookback is not suitable.
2. Incremental predicates simply injects compiled code into the merge condition without resolving these as constants, so even if I defined the predicate with a SQL relationship e.g., the distinct parititons in the temporary table, BigQuery would still not be able to prune.

So the solution was a custom one; find a way to intercept the dbt merge command between when the temporary table is built and when the merge operation runs, resolve the distinct partition fields, then inject them into the merge SQL.

This solution involved overwriting the dbt's adapter defined bq_generate_merge....sql <action to claude: find the name of the materialisation that dbt-bigquery adapter defines, I can't remember the exact name of it> by redefining it in our local dbt project. The new materialisation mirrored dbt's but ran a series of macros to query the temporary table for distinct partitions and to then compile them into the merge job.

Once setup, models require a one-line config change to enable the paritioning. After extending this framework for update and delete operations, I packaged this up and shared it with other teams, accompanied with a Claude Plugin that would setup the materialisation in their own projcet, insteall the package and identify candidate models.

- Result
In our payment lifecyle pipeline alone, our BigQuery costs dropped by ~25% which was ~£175k per year. Around 25 models in total were configured with this pruning merchanism some of which saw total dbt run cost reductions of ~95%.

I ran a knowledge sharing session at Checkout demonstrating this and other teams are currently planning to implement the framework using my package. I've paired this with a Cluade plugin that helps with setup and identifies candidate models for dynamic DML pruning. Other teams are planning this implmentation and I forecast an additional £50k per year of savings across all other dbt projects at Checkout.com.

- Current limitaitons
1. The partitoned field must be immutable, otherwise there is a risk that a changed partioned value will be excluded from the merge update condition so the record will be inserted into the target table as a duplicate.
2. For incremental merge models, on_schema_change cannot equal 'ignore' as dbt-bigquery does not create a temporary table in these cases and instead combines the processing of the new batch and the mutation operation in the same BigQuery job.

- Trade-offs
The trade-off is a small amount of maintaince required when upgrading dbt versions as the pruning framework requires a shim of  bq_generate_merge....sql <action to claude: find the name of the materialisation that dbt-bigquery adapter defines, I can't remember the exact name> of it to be defined in each dbt project. 

- Future builds
1. Provide methods to relax the immutability condition e.g., create a lightweight lookup table of containing the primary key and the current partitioned field value in the target table. 
2. We can extend the method to improve the performance of reads by storing metadata about the partitioned field in lightweight lookup tables.

Key aspects of the framework:
- **Opt-in DML approach**: targets the most expensive models in the estate — those that cannot be fully partition-pruned with standard incremental strategies — and applies fine-grained DML to allow BigQuery to prune partitions precisely rather than scanning unnecessary data.
- **Claude plugin for ease of setup**: Tom packaged the framework alongside a Claude plugin that guides engineers through configuring it correctly, lowering the barrier to adoption and reducing the risk of misconfiguration.
- **Company-wide distribution**: the framework was published internally and distributed across the analytics engineering organisation, with Tom leading knowledge-sharing sessions on partition pruning.

---

## BigQuery table enrichment (250TB / 25bn-row table)

Situation
We model the lifecycle of all payments that Checkout process. Authentication is an early stage of the payment lifecycle and it's source-of-truth is the Authenticaiton service at Checkout. We were infering authentication attributes of the payment from payment data produced by the source of truth for payment requests. This caused two problems:
1. Poor data correctness; the inferences made were not 100% reliable and were often a best guess at what happened during Authentication
2. We were missing a lot of authentication data points that are important to understand how authentication impacts authorisation rates. E.g., quantifying how much certain authenticaiton experiences impact the changes of a successful authoirsation.

Task
Authenticaiton payment-lifecyle requirements needed to be gathered across a number of stakeholders including a financial director, Authenticaiton product managers, Merchant facing Dashboard product managers and engineers, downstream analytics engineers, prouduct data scientists and payment specialists. Then we'd need to enrich our payment lifecycle model with Authentication-sourced data ensuring.

Action
After requirements were gathered, they were modelled into user stories that challenged the importance of each requirment. Each user story was then assessed for feasibility and a proposal was made against each user story which was then shared with the relevant stakeholders to reach agreement.

The next stages was to document the new schema, including new defintions, metrics, tests. This was shared with other analytics engineers who managed the payment lifecycle so that the proposal could be challenged.

Following an agreement, a PoC was deployed into a mirror of our payment lifecycle model with a 2 day retention to keep costs down. This could then be reviewed for data correctness and by the stakeholders.

A technical design was also shared with other analytics engineers for them to challenge and agree on decisons. The key technical challenges in this project were:
1. How do we accurately link authentications to payments. This was accompanied by a dbt-test that confirms that all sessions are being included in the join on each run.
Some payments can trigger/involve multiple sessions and it is not always clear which sessions is the one that authenticates the payment and is then passed on during authorisation. This required a cordintation between the Authenticaiton and Gateway teams as well as payment specialists to understand how to replicate operational logic within dbt which required nuainced logic applied depending on the authenticaiton expeirence, authentication session result, region and scheme. dbt tests were also setup to maintain confidence and observaibility that this logic matches the operation behaviour.

2. Considering that our payment lifecyle model is ~250TB increasing by 100s of GBs a day, and our authentication source is ~10TB, how do we make this enrichment cost-effective.
Options here were: i) an on the fly join, or ii) a enrichement via an update statement.
Trade-offs:
On the fly join required a large join, typical payment batches were between 10 and 50GBs, running joining this against a 10TB table would not be feesibile. We needed to include a timebounded filter on authentication data. Authentication engineers we able to support by informing us that an authentication can occur at most 
Pros: Simplist solution to implment
Cnns: Would be very expensive if long time-lags were possible between authentications and payment requests.

Update enrichment method:
Pros: Using the aforementioned DML dynamic pruning, this can be made efficient if we have a long tail of late arring data.
Cons: 
- More complex implementaiton.
- Not atomic with the payment lifecyle's merge (the update mechanism would run after the merge meaning there would be a period of time where a single row of data could be fresh for non-authentication fields, but stale for authentication fields).
Decison: Use a join within the merge model as authenticaion sessions are short-lived and happen within a short timespan of the payment request. 
3. As we are joining two sources of data together, how do we ensure data correctness. I.e., how do we avoid and monitor data points from each source conflating with each other. 
Setup dbt tests monitoring conflating data points. Some data points conflating by design e.g., JSON fields that we decided not to unpack, enrich then repack due to cost. For these fields, the descrepancies were transparently documented and shared on release.

Result
90% of stakeholder user stories were delivered, the remaining 10% were pushed back on due to them having a low impact to cost ratio. This enabled:
1. Downstream analytics engineers and data scientissts no longer needed to model their own custom joins to authenticaiton which centralised the join logic and reduced overall compute costs of running heavy joins in multiple models. 
2. Unlocked the ability to easily montor how authentication impacts authorisation perofmrance which enables checkout to make more informed decisions about how to optimise for KPIs such as acceptance rates.
3. Allowed us to report to merchants how much money could be saved from enabling liability shifts for qualifying payments.
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
