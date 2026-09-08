import { RESUME as R } from './resume.js'

// Curated, readable groupings: extra stops only for the two longer chapters.
export const TOUR_CARDS = {
  profile: [{ title: R.profile.name, kicker: 'FULL STACK + GENERATIVE AI', detail: 'Senior Software Engineer', bullets: [R.profile.bio, `${R.profile.location} · GSoC contributor · Kavach 2023 winner.`] }],
  skills: [{ title: 'Full stack + AI toolkit', kicker: 'LANGUAGES · PRODUCTS · PLATFORMS', bullets: [
    'Java, JavaScript, TypeScript, Python, Go, C/C++ and SQL. React, Node.js, React Native and Android.',
    'Spring Boot, gRPC, Kafka, Elasticsearch and Aerospike. LangChain, RAG and MCP, with Firebase, Kubernetes and Akamai.',
  ] }],
  experience: [
    { title: 'Naukri.com · Info Edge', kicker: 'OCT 2024 – PRESENT', detail: 'Senior Software Engineer', bullets: [
      'Built AmbitionBox MCP and LangChain RAG agents: 50% better contextual accuracy and 25% higher engagement.',
      'Cut security infrastructure costs 50% with bot defense and rate limiting. Delivered embedding-based deduplication, Kubernetes migrations, Akamai policies and CAPTCHA.',
      'Real-time messaging and AI moderation increased community interactions 25% and content engagement 100%.',
    ] },
    { title: 'Helium + Swiggy Instamart', kicker: 'OCT 2023 – OCT 2024', detail: 'Product engineering · Web + mobile', bullets: [
      'Helium: built Glide, an AI-powered visual e-commerce editor using low-level React APIs. Integrated Flare personalization and migrated CSR to ISR.',
      'Swiggy: improved production reliability with New Relic monitoring, migrated Picker workflows from Next.js to React Native, and revamped the IM Retails UI.',
    ] },
  ],
  projects: [
    { title: 'Forensics + agentic travel', kicker: 'SELECTED PROJECTS · 01', bullets: [
      'Hardware Forensic Suite: disk, memory and network analysis. Winner of the Kavach 2023 Cyber Security Hackathon by AICTE, BPRD and I4C.',
      'WayFinder: a LangChain travel agent researching across booking, transport, food and web services to build personalized, budget-optimized itineraries.',
    ] },
    { title: 'Compilers + LLM research', kicker: 'SELECTED PROJECTS · 02', bullets: [
      'BLAH.JS: a TypeScript UI library with a custom compiler, parser and VS Code extension. Uses ID-based element tracking for efficient DOM updates.',
      'Rolling The Dice: research evaluating LLM reasoning, planning and long-term strategic decisions through Monopoly.',
    ] },
  ],
  education: [{ title: 'Jamia Millia Islamia', kicker: 'EDUCATION · 2020–2024', detail: 'B.Tech. · Electronics & Communication', bullets: ['Graduated with an 8.99 CGPA.', 'CBSE Higher Secondary: 92.6% (2020). Secondary: 84.8% (2018).'] }],
  about: [{ title: 'Open source + community', kicker: 'GSOC · SCORELAB · AGAMI', bullets: [
    'Google Summer of Code 2022: modernized Codelabz UI, architecture and dependencies; built serverless backend APIs with Firebase Cloud Functions.',
    R.about.story,
  ] }],
  contact: [{ title: 'Let’s build something.', kicker: 'MOHAMMAD SARFRAZ ALAM', bullets: [`${R.contact.email} · ${R.contact.phone}`, `${R.profile.location}. GitHub: Sarfraz-droid. LinkedIn: Sarfraz Alam.`, 'The full résumé and project links are available from the Résumé and plain-text buttons.'] }],
}
