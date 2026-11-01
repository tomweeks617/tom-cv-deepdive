export type Role = {
  company: string;
  url?: string;
  descriptor: string;
  title: string;
  period: string;
  note?: string;
  bullets: string[];
};

export const experience: Role[] = [
  {
    company: "Checkout.com",
    url: "https://www.checkout.com",
    descriptor: "Global payments platform serving enterprise merchants worldwide",
    title: "Analytics Engineer II",
    period: "Feb 2025 – Present",
    bullets: [
      "Designed and rolled out an opt-in DML partition-pruning framework for dbt-bigquery resulting in a **~25% reduction** in pipeline cost, equivalent to **£175k** annualised savings. Packaged the framework alongside a Claude plugin for ease of setup and distributed company-wide. Forecasting an additional **£50k** of annual savings.",
      "Enriched a **250TB / 25bn-row** BigQuery table with **~10TB** of source-of-truth data and kept it up-to-date via a bihourly pipeline, eliminating costly ad-hoc multi-TB joins while improving data correctness.",
      "Technical owner and SME for Checkout.com's Apache Druid vendor partnership, acting as the primary escalation point for incidents; now leading a proof of concept evaluating migration to Google BI Engine to improve reliability and increase engineering velocity.",
      "Designed and delivered scalable analytics pipelines that increased merchant-facing insight coverage by **5×**, significantly expanding low-latency self-service reporting capabilities for enterprise customers — contributing to Checkout.com's **5/5 Forrester Wave** score for 'Data, Analytics & Insights' (2026 Q1).",
      "Own the pipelines and reliability of multiple production data products serving internal teams and enterprise merchants, including **24/7 on-call** escalation for business-critical models.",
      "Migrated multiple production data products from Snowflake to BigQuery — alternative payment methods, vault instrument, authentication, merchant-facing analytics datasets, dimensional models and lower-environment infrastructure — contributing to a **~30% cost saving** while maintaining platform performance and reliability.",
      "Shaped team practices beyond own delivery: built a Claude plugin for analytics engineering standards, led knowledge-sharing sessions on partition pruning and Imply/Druid, and interviewed AE candidates.",
    ],
  },
  {
    company: "Stenn Technologies",
    url: "https://www.stenn.com",
    descriptor: "Global fintech start-up",
    title: "Analytics Engineer",
    period: "Apr 2024 – Dec 2024",
    note: "Role concluded following company administration.",
    bullets: [
      "Worked cross-functionally with Marketing and Revenue Operations teams to design and build attribution models that enabled optimisation of a **$6 million paid-search budget**.",
      "Developed and trialled an early AI marketing product to personalise outbound emails, lifting click-through rate by **35%**.",
      "Owned Marketing data pipelines end to end: ELT, reverse ETL, data quality management and data governance.",
      "Refactored complex dbt models to adopt best practices and introduced more comprehensive dbt testing.",
      "Built and maintained Looker explores and dashboards; conducted Looker training sessions to enable business-wide self-serve analytics.",
    ],
  },
  {
    company: "Ocado Retail",
    url: "https://www.ocado.com",
    descriptor: "Retail media: data products and monetisation",
    title: "Data Analyst → Senior Data Analyst → Data Engineer",
    period: "Apr 2021 – Apr 2024",
    bullets: [
      "Owned from conception to execution the integration of an ad-tech platform's API (Python, JavaScript, SQL), saving **2,000+ hours** of admin work annually and removing costly human errors.",
      "Owned the development of automated personalised supplier communication technology, resulting in a **15% increase in media revenue** and overwhelmingly positive supplier feedback.",
      "Priced media assets generating **£50m** in annual revenue; analysed pricing risk and co-presented risk mitigation solutions to senior leadership, shaping the long-term media pricing strategy.",
      "Standardised the media booking process and built document-scraping technology underpinning reliable reporting of **£100m** in media revenue.",
      "Devised an improved featured-product algorithm that resulted in a **10% increase** in ad revenue (approximately **£125,000/year**).",
      "Led a demand-side-platform integration, engineering pipelines that enabled first-party data monetisation worth **£250k annually**.",
      "Led a weekly workshop that grew weekly ad revenue **420%** over 12 months, equating to roughly **£1m** of incremental revenue at run rate.",
      "Established and managed critical data feeds pivotal to media monetisation strategy.",
      "Led training sessions for analysts in advanced SQL and process optimisation, fostering a culture of continuous improvement.",
    ],
  },
  {
    company: "Wickes",
    url: "https://www.wickes.co.uk",
    descriptor: "Retail",
    title: "Data Analyst",
    period: "Aug 2019 – Apr 2021",
    bullets: [
      "Delivered analysis that challenged assumptions around loyalty sign-ups, resulting in a **40%** increase in scheme adoption.",
    ],
  },
];

export const skillGroups: { label: string; skills: string[] }[] = [
  { label: "Data Warehouse", skills: ["Snowflake", "BigQuery"] },
  {
    label: "Analytics Engineering",
    skills: [
      "SQL",
      "dbt",
      "LookML",
      "ELT / Reverse ETL",
      "Dimensional Modelling",
      "Semantic Layer Design",
      "Metric Definitions",
      "Data Marts",
      "Third-party API Integration",
      "Fivetran",
      "Hightouch",
    ],
  },
  { label: "Programming", skills: ["Python", "JavaScript"] },
  { label: "BI & Reporting", skills: ["Looker", "Tableau"] },
  { label: "Cloud & Infrastructure", skills: ["GCP", "AWS"] },
  { label: "Orchestration & DevOps", skills: ["Airflow", "GitHub", "CI/CD"] },
  { label: "Streaming", skills: ["Apache Flink"] },
];

export const education = [
  {
    institution: "University of Reading",
    qualification: "BSc Mathematics and Economics",
    detail: "First-Class Honours",
  },
  {
    institution: "A-Levels",
    qualification: "Economics, Mathematics and Physics",
    detail: "A*AA",
  },
];
