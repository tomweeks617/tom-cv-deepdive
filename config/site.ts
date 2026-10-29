export const site = {
  name: "Tom Weeks",
  title: "Engineering & Analytics Data Professional",
  tagline:
    "Engineering & Analytics Data Professional with 7 years of experience building scalable data products, analytics platforms and revenue-generating solutions across fintech and retail.",
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
    { value: "5×", label: "Merchant Insight Coverage" },
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
