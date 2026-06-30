# Technical Skills

This file describes Tom's technical toolkit and where each skill was used in practice. Depth claims are backed by the roles referenced.

## Data warehouses

- **Snowflake** — primary warehouse at Stenn Technologies and at Checkout.com before the BigQuery migration; Tom was responsible for the migration of high volume multiple production data products off it as well as continued development and maintaince.
- **BigQuery** — migration target at Checkout.com. Tom led the Snowflake → BigQuery migration of dimensional models, merchant-facing analytics datasets and lower-environment infrastructure, contributing to ~40% cost savings at equal performance and reliability. Also used at Ocado Retail (GCP shop).

## Analytics engineering

- **SQL** — Tom's deepest skill, used daily across all roles for 7 years. He has also taught advanced SQL to analyst teams at Ocado.
- **dbt** — 3 years of production experience, dbt-certified. First encountered at Ocado (ran a PoC). Used in production at Stenn and at Checkout.com. The most complex dbt work Tom has done was building the pipeline that feeds Imply (the Apache Druid platform) with aggregated merchant analytics data at Checkout.com. The challenges were: (1) Imply is expensive to store data in, so only aggregated data could be sent; (2) Imply does not support large-scale updates, requiring an insert-only approach where changed records had to be handled via negations — appending a sign-reversed version of the old aggregated record and then the updated record; (3) the data volumes made the model very costly to run. To build this, Tom used: **macros** for DRY iteration over currencies (FX conversions), dimensions, count metrics and value metrics; a **macro with parameters** that executed a BigQuery → GCS data unload; **post-hooks** to trigger the unload after model materialisation; **custom dbt tests** to validate that the model remained aligned to its upstream data product after negation; and a **custom incremental strategy** implementing the negation logic. He built multiple variants of these models covering payment-event-level and payment-level aggregated data across different payment event types. The pipeline was production-critical with both internal and external SLAs, received 24/7 support, and proved robust as it scaled to new currencies and metrics over time.
- **LookML / Looker** — Looker admin and developer at both Stenn and Checkout.com. Experience building Looker views, explores and dashboards and ran Looker training sessions so business users could self-serve analytics. 
- **ELT / Reverse ETL** — owned marketing data pipelines end-to-end at Stenn, including ELT, reverse ETL, data quality management and data governance. Tools: Fivetran, Hightouch. 
- **Dimensional modelling, semantic layer design, metric definitions, data marts** — applied across Checkout.com's merchant-facing analytics products and the BigQuery migration; also followed Kimball modelling at Ocado. A concrete example of meaningful design work is the Imply pipeline at Checkout.com. The aggregated fact data sent to Imply is built on top of a well-defined semantic layer with consistent metric definitions and no definitional drift across consumers. Some of the dimensions in these aggregations are slowly changing. Given the append-only negation pattern the pipeline uses (where updated records require a negation of the old aggregated row and insertion of a new one), embedding slowly changing dimensional values directly into the fact records would create correctness problems. The solution was to model Imply to resolve dimensions at query time via a dimensional lookup table that holds the current (Type 1) version of each slowly changing dimension — keeping the fact records clean and ensuring queries always reflect the latest dimensional state.
- **Third-party API integration** — owned the integration of an ad-tech platform's API at Ocado (Python, JavaScript, SQL), saving 2,000+ hours/year of manual work.


## Programming

- **Python** — used for specific, high-value tasks rather than as a daily language: writing scraping scripts (Box SDK at Ocado), integrating third-party APIs (Citrus ad-tech, The Trade Desk DSP, Imply), and authoring Airflow DAGs. Tom can read Python fluently, assess whether code is well-structured and follows best practices, and write what is needed for pipeline and integration work. He would describe himself as competent in Python with real-world examples of successful production applications, but would not claim the same level of expertise he has in SQL and dbt.
- **JavaScript** — used alongside Python in the Ocado ad-tech integration.

## BI & reporting

- **Looker** (primary) and **Tableau**.

## Cloud, infrastructure & DevOps

- **GCP** — BigQuery, GCS, Filestore, Cloud Functions, Cloud Composer (managed Airflow). Primary cloud environment at Checkout.com and Ocado.
- **AWS** — S3, DataSync, EC2, Athena, Secrets Manager. Used at Checkout.com, including DataSync for the Snowflake → BigQuery data copy during migration.
- **Terraform** — creates and maintains infrastructure assets (e.g. GCS buckets) using modules built by the Data Platform team. Tom works within established Terraform patterns rather than authoring modules from scratch.
- **Airflow** — builds DAGs from scratch, maintains and refactors existing ones. At Checkout.com, built the DAG orchestrating the merchant-facing analytics pipeline: triggered on completion of the bi-hourly upstream data products DAG, it runs dbt models, executes tests, loads data to GCS, DataSyncs to S3, calls the Imply API to ingest data, and runs validation tests against both the Imply and BigQuery APIs to confirm data correctness. Also authored Airflow DAGs at Ocado for the media booking and data pipeline automation.
- **GitHub** and **CI/CD** for delivery.

## Streaming

- **Apache Flink** — worked with Flink at Checkout.com in the context of streaming data pipelines that fed the analytics infrastructure. Tom's involvement was adding new fields to existing Flink jobs and writing tests for them, rather than architecting Flink jobs from scratch.

## AI tools

- **Claude** — Tom built and launched a Claude plugin for merchant-facing analytics data products at Checkout.com; it reduced analytics feature delivery time by 60% and was adopted across a 30-person analytics organisation.
- **Cursor** — day-to-day AI-assisted engineering.
- At Stenn (2024), Tom developed and productionised an early AI marketing product that personalised outbound emails, lifting click-through rate by 35%.

