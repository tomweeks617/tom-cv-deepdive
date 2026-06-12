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
      "Own the architecture, reliability and roadmap of multiple production analytics products serving internal teams and enterprise merchants.",
      "Led the migration of production data products from Snowflake to BigQuery (including dimensional models, merchant-facing datasets and lower environments), contributing to **~40% cost savings** at equal performance and reliability.",
      "Developed and launched a Claude plugin for merchant-facing analytics products that cut feature delivery time by **60%**, adopted across a **30-person analytics organisation**.",
      "Designed scalable analytics pipelines that increased merchant-facing insight coverage **5×**, expanding low-latency self-service reporting for enterprise customers.",
      "Technical owner and subject-matter expert for Checkout.com's Apache Druid partnership, driving adoption, vendor engagement and production reliability.",
      "Played a key role in Checkout.com's industry-leading **5/5 Forrester Wave** score for Data, Analytics & Insights (2026 Q1).",
      "Sole escalation point on a **24/7 support rota** for critical analytics infrastructure, including incident management.",
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
      "Designed and built attribution models with Marketing and Revenue Operations that enabled optimisation of a **$6m paid-search budget**.",
      "Developed and productionised an early AI marketing product personalising outbound emails, lifting click-through rate by **35%**.",
      "Owned marketing data pipelines end to end: ELT, reverse ETL, data quality and governance.",
      "Refactored complex dbt models to best practice with comprehensive testing; built Looker explores and dashboards and ran training so teams could self-serve analytics.",
    ],
  },
  {
    company: "Ocado Retail",
    url: "https://www.ocado.com",
    descriptor: "Retail media: data products and monetisation",
    title: "Data Analyst → Senior Data Analyst → Data Engineer",
    period: "Apr 2021 – Apr 2024",
    bullets: [
      "Owned the integration of an ad-tech platform's API (Python, JavaScript, SQL), saving **2,000+ hours** of admin work annually and removing costly human error.",
      "Led a demand-side-platform integration, engineering pipelines that enabled first-party data monetisation worth **£250k annually**.",
      "Led a weekly workshop that grew weekly ad revenue **420%** over 12 months, equating to roughly **£1m** of incremental revenue at run rate.",
      "Priced media assets generating **£50m** in annual revenue and co-presented risk mitigation to senior leadership, shaping long-term pricing strategy.",
      "Built automated supplier campaign notifications that lifted media revenue **15%**; improved the featured-product algorithm for a further **10%** (~£125k/year).",
      "Standardised the media booking process and built document-scraping technology underpinning reliable reporting of **£100m** in media revenue.",
      "Acted as SME for media data and trained analysts in advanced SQL and process optimisation.",
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
  { label: "Data Warehouses", skills: ["Snowflake", "BigQuery"] },
  {
    label: "Analytics Engineering",
    skills: [
      "SQL",
      "dbt",
      "LookML",
      "ELT / Reverse ETL",
      "Dimensional Modelling",
      "Semantic Layer Design",
      "Fivetran",
      "Hightouch",
    ],
  },
  { label: "Programming", skills: ["Python", "JavaScript"] },
  { label: "BI & Reporting", skills: ["Looker", "Tableau"] },
  { label: "Cloud & Infrastructure", skills: ["GCP", "AWS", "Terraform"] },
  { label: "Orchestration & DevOps", skills: ["Airflow", "GitHub", "CI/CD"] },
  { label: "AI Tools", skills: ["Claude", "Cursor"] },
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
