# Checkout.com — Analytics Engineer II (February 2025 – present)

Checkout.com is a global payments platform serving enterprise merchants worldwide. Tom joined in February 2025 as Analytics Engineer II and owns the architecture, reliability and roadmap of multiple production analytics products. These products serve two audiences: internal teams and — unusually for an analytics engineering role — **external enterprise merchants**, which raises the bar on reliability, latency and polish.

## Snowflake → BigQuery migration (~40% cost savings)

### Why the migration happened

After a long-running Snowflake contract, the commercial costs had become very expensive. Following a POC, BigQuery proved to be considerably cheaper — material savings given that some tables Checkout.com operates are in the **hundreds of terabytes**. At that scale, cost-effective compute and storage is essential. The company-wide migration followed.

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

## Claude plugin (60% faster feature delivery)

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

Tom shared this as a plugin across the entire analytics team. The result was a **~60% reduction in new feature delivery time**, with team members independently reporting similar savings.

---

## Merchant-facing analytics (5× insight coverage, Forrester 5/5)

Tom designed and delivered scalable analytics pipelines that increased merchant-facing insight coverage by **5×**, significantly expanding low-latency self-service reporting capabilities for enterprise customers. This work played a key role in Checkout.com achieving an **industry-leading 5/5 Forrester Wave score for "Data, Analytics & Insights" in 2026 Q1** — external validation that the merchant analytics capability is best-in-class in the payments industry.

---

## Apache Druid partnership ownership

Tom is the technical owner and subject-matter expert for Checkout.com's partnership with Imply (the Apache Druid service provider). He drives adoption internally, manages vendor engagement, and is accountable for production reliability of the Druid-backed systems. Druid underpins the low-latency analytics serving layer for the merchant-facing dashboard.

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
