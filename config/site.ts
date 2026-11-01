export const site = {
  name: "Tom Weeks",
  title: "Data Engineering & Analytics Professional",
  tagline:
    "Data Engineering & Analytics Professional with 7 years of experience building scalable data products, analytics platforms and revenue-generating solutions across fintech and retail.",
  email: "tom.weeks15@gmail.com",
  linkedin: "https://www.linkedin.com/in/tom-weeks-4a5109189",
  cvPdfPath: "/tom_weeks_cv.pdf",
  cvPdfFilename: "Tom_Weeks_CV.pdf",
  highlights: [
    { value: "£1m+", label: "Annualised Revenue Impact" },
    { value: "£175k", label: "Pipeline Cost Savings" },
    { value: "2,000+", label: "Hours Automated Annually" },
    { value: "£250k", label: "First-Party Data Monetisation" },
    { value: "420%", label: "Ad Revenue Growth" },
    { value: ">250TB", label: "Scale of Data Pipelines Managed" },
  ],
} as const;

// Clickable example prompts for the "Ask about Tom" chat (Phase 3).
// Edit freely — the UI renders whatever is listed here.
export const exampleQuestions: string[] = [
  "Tell me about the DML partition-pruning framework that led to £175k of savings",
  "Explain the Apache Druid pipeline Tom owns and why he's leading a migration away from it",
  "What are the most complex dbt models Tom has built and why were they difficult?",
  "What's the greatest commercial impact Tom has had in his career?",
  "How did Tom grow Ocado's ad revenue by 420% in 12 months?",
  "Tell me about a time Tom pushed back on a stakeholder brief",
  "How has Tom used AI tooling to improve his team's engineering output?",
  "Walk me through Tom's career progression and what connects each move",
  "What kind of role is Tom looking for?",
];
