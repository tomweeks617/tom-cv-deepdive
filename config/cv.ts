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
      "Designed and rolled out an opt-in DML partition-pruning framework for dbt-bigquery resulting in a **~25% reduction** in pipeline cost in our project, equivalent to **£175k** annualised savings. Packaged the framework alongside a Claude plugin for ease of setup and distributed company-wide. Forecasting an additional **£50k** of annual savings.",
      "Enriched a **250TB / 25bn-row** BigQuery table with **~10TB** of source-of-truth data and kept it up-to-date via a bihourly pipeline, eliminating costly ad-hoc multi-TB joins while improving data correctness.",
      "Technical owner and SME for Checkout.com's Apache Druid vendor partnership, acting as the primary escalation point for incidents; now leading a proof of concept evaluating migration to Google BI Engine to improve reliability and increase engineering velocity.",
      "Designed and delivered scalable analytics pipelines that increased merchant-facing insight coverage by **5x**, significantly expanding low-latency self-service reporting capabilities for enterprise customers contributing to Checkout.com's Q1 2026 industry-leading **5/5 Forrester Wave** score for 'Data, Analytics & Insights'.",
      "Own the pipelines and reliability of multiple production data products serving internal teams and enterprise merchants, including **24/7 on-call** escalation for business-critical models.",
      "Migrated multiple production data products from Snowflake to BigQuery, including alternative payment methods, vault instrument, authentication, merchant-facing analytics datasets, dimensional models, and lower-environment infrastructure, contributing to a **~30% warehouse cost saving** while maintaining performance and reliability.",
      "Shaped team practices beyond my own delivery: built a Claude plugin for analytics engineering standards, led knowledge-sharing sessions on partition pruning and Imply/Druid, and interviewed AE candidates.",
    ],
  },
  {
    company: "Stenn Technologies",
    url: "https://www.stenn.com",
    descriptor: "Global fintech startup",
    title: "Analytics Engineer",
    period: "Apr 2024 – Dec 2024",
    note: "Role concluded following company administration.",
    bullets: [
      "Worked cross-functionally with Marketing and Revenue Operations teams to design and build complex attribution models that enabled Digital Marketing teams to optimise a **$6 million** paid search budget.",
      "Developed and productionised an early AI marketing product to personalise outbound emails leading to a **35%** increase in CTR.",
      "Owned Marketing data pipelines, including ELT, reverse ETL, data quality management, and data governance.",
      "Refactored complex dbt models to adopt best practices and introduced more comprehensive dbt testing.",
      "Built and maintained Looker Explores/Dashboards and conducted Looker training sessions to the wider business allowing users to self-serve their own analytics.",
    ],
  },
  {
    company: "Ocado Retail",
    url: "https://www.ocado.com",
    descriptor: "Built data products, monetisation solutions and analytics systems supporting Ocado's Retail Media business",
    title: "Data Analyst → Senior Data Analyst → Data Engineer",
    period: "Apr 2021 – Apr 2024",
    bullets: [
      "Owned from conception to execution the integration of an ad tech platform's API using Python, JavaScript, and SQL. This facilitated the efficient implementation of media, saving over **2,000 hours** annually of admin work across the business and removing costly human errors.",
      "Owned the development of automated personalised communication technology that notifies suppliers whenever their media campaigns require attention. This resulted in a **15%** increase in media revenue and overwhelmingly positive feedback from suppliers.",
      "Priced media assets that generate **£50 million** in revenue annually, analysed the risk of the new pricing model, and co-presented risk mitigation solutions to senior leadership that shaped the long-term media pricing strategy.",
      "Standardised the media booking process, trained the buying teams on how to use the new process, and developed document scraping technology that provides robust data for reliable reporting of **£100 million** in media revenue.",
      "Devised an improved featured product algorithm that resulted in a **10%** increase in ad revenue (approximately **£125,000/year**).",
      "Led the integration of a demand-side-platform, collaborating cross-functionally to engineer data pipelines that enable the monetisation of first-party data valued at **£250,000** annually.",
      "Led a weekly workshop that increased weekly ad revenue by **420%** over a 12-month period (equating to ~ **£1 million** of incremental revenue at run rate).",
      "Established and managed critical data feeds, pivotal to media monetisation strategy.",
      "Led training sessions for analysts, equipping teams with advanced skills in SQL and process optimisation, fostering a culture of continuous improvement.",
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
