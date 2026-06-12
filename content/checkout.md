# Checkout.com — Analytics Engineer II (February 2025 – present)

Checkout.com is a global payments platform serving enterprise merchants worldwide. Tom joined in February 2025 as Analytics Engineer II and owns the architecture, reliability and roadmap of multiple production analytics products. These products serve two audiences: internal teams and — unusually for an analytics engineering role — **external enterprise merchants**, which raises the bar on reliability, latency and polish.

## Snowflake → BigQuery migration (~40% cost savings)

Tom led the migration of multiple production data products from Snowflake to BigQuery, including:

- Alternative Payment Methods datasets
- Vault Instrument datasets
- Authentication datasets
- Merchant-facing analytics datasets
- Dimensional models
- Lower-environment (non-production) infrastructure

The migration contributed to **~40% cost savings** while maintaining platform performance and reliability. This was a live-production migration of merchant-facing products, so it had to be done without degrading what enterprise customers see.

<!-- TOM: this is the #1 target question ("tell me about the BigQuery migration"). Add: why the migration happened, how you sequenced/validated it (e.g. parallel running, reconciliation), the hardest problem you hit, how long it took, and what you'd do differently. -->

## Claude plugin (60% faster feature delivery)

Tom developed and launched a Claude plugin for Checkout.com's merchant-facing analytics data products. It reduced analytics feature delivery time by **60%**, and was subsequently adopted across a **30-person analytics organisation** to accelerate engineering productivity. This is a concrete example of Tom identifying an AI-tooling opportunity, building it, and driving org-wide adoption — not just personal productivity.

<!-- TOM: target question. Add: what the plugin actually does (skills/commands/context it provides), why a plugin rather than prompting, how you measured the 60%, and how you drove adoption across the org. -->

## Merchant-facing analytics (5× insight coverage, Forrester 5/5)

Tom designed and delivered scalable analytics pipelines that increased merchant-facing insight coverage by **5×**, significantly expanding low-latency self-service reporting capabilities for enterprise customers. This work played a key role in Checkout.com achieving an **industry-leading 5/5 Forrester Wave score for "Data, Analytics & Insights" in 2026 Q1** — external validation that the merchant analytics capability is best-in-class in the payments industry.

## Apache Druid partnership ownership

Tom is the technical owner and subject-matter expert for Checkout.com's partnership with an Apache Druid service provider. He drives adoption internally, manages vendor engagement, and is accountable for production reliability of the Druid-backed systems. Druid underpins the low-latency analytics serving layer.

## Operational ownership and 24/7 support

Tom is responsible for operational support and incident management of business-critical analytics infrastructure. He serves on a **24/7 support rota as the sole escalation point** for critical analytics systems — when merchant-facing analytics breaks at 3am, Tom is the person who gets called. This reflects the level of trust placed in him and his comfort owning production systems, not just building them.

<!-- TOM: add an incident story if you have one you can share (sanitised): what broke, how you diagnosed it, what changed afterwards. "Tell me about an incident you handled" is a common interview question. -->
