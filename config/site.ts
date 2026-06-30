export const site = {
  name: "Tom Weeks",
  title: "Analytics Engineer",
  tagline:
    "Analytics Engineer with 7 years of experience building scalable data products, analytics platforms and revenue-generating solutions across fintech and retail.",
  email: "tom.weeks15@gmail.com",
  cvPdfPath: "/tom_weeks_cv.pdf",
  cvPdfFilename: "Tom_Weeks_CV.pdf",
  highlights: [
    { value: "£1m+", label: "Annualised Revenue Impact" },
    { value: "~40%", label: "Warehouse Cost Reduction" },
    { value: "2,000+", label: "Hours Automated Annually" },
    { value: "£250k", label: "First-Party Data Monetisation" },
    { value: "420%", label: "Ad Revenue Growth" },
    { value: "60%", label: "Faster Feature Delivery" },
  ],
} as const;

// Clickable example prompts for the "Ask about Tom" chat (Phase 3).
// Edit freely — the UI renders whatever is listed here.
export const exampleQuestions: string[] = [
  "Explain the £1m revenue impact Tom delivered",
  "How competent is Tom using dbt?",
  "Tell me about the BigQuery migration at Checkout.com",
  "Tell me about the Claude plugin Tom built",
  "How did Tom create a £250k/year revenue stream at Ocado?",
  "How did Tom automate 2,000+ hours of work a year?",
  "Tell me about Tom as a person",
];
