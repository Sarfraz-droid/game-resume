const resumePdf = new URL('../../Resume.pdf', import.meta.url).href

// Transcribed from the supplied Resume.pdf. Dates and metrics are retained as
// stated in that document; editorial summaries do not add new achievements.
export const RESUME = {
  profile: {
    name: 'Mohammad Sarfraz Alam',
    role: 'Senior Software Engineer · Full Stack & Gen AI',
    bio: 'Full-stack engineer building product experiences, backend platforms, and agentic AI workflows. Currently at Naukri.com (Info Edge India Ltd.).',
    location: 'Noida, Uttar Pradesh, India',
    facts: ['Naukri.com · Helium · Swiggy · Google Summer of Code', 'B.Tech. ECE, Jamia Millia Islamia · 8.99 CGPA', 'Kavach 2023 Cyber Security Hackathon winner'],
  },
  resumeUrl: resumePdf,
  contact: {
    email: 'alamsarfraz422@gmail.com', phone: '+91-7303435034',
    linkedin: 'https://www.linkedin.com/in/sarfraz-alam-113575201/',
    github: 'https://github.com/Sarfraz-droid',
  },
  skills: [
    { group: 'Languages', items: ['Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'SQL', 'Python', 'Go'] },
    { group: 'Product engineering', items: ['React.js', 'Node.js', 'React Native', 'Android', 'Testing'] },
    { group: 'Services & data', items: ['gRPC', 'Spring Boot', 'Kafka', 'Elasticsearch', 'Aerospike'] },
    { group: 'Applied in my work', items: ['LangChain', 'RAG', 'MCP', 'Firebase Cloud Functions', 'Kubernetes', 'Akamai'] },
  ],
  experience: [
    { role: 'Senior Software Engineer', company: 'Naukri.com · Info Edge India Ltd.', period: 'Oct 2024 – Present', points: [
      'Worked across frontend, backend, and agentic AI workflows as a Full-Stack AI Engineer across multiple product pods.',
      'Engineered bot defense and rate limiting, reducing security infrastructure costs by 50%.',
      'Built AmbitionBox MCP and LangChain RAG agents: 50% better contextual accuracy and 25% higher user engagement.',
      'Architected vector embedding and clustering-based deduplication, reducing identified duplicate pages by 100%.',
      'Led Kubernetes and machine migrations and implemented Akamai security policies to improve production reliability.',
      'Built real-time messaging and agentic AI moderation for AmbitionBox Communities: interactions increased 25%, content engagement 100%.',
      'Implemented site-wide CAPTCHA validation to mitigate malicious traffic, scraping, and data abuse.',
    ] },
    { role: 'Software Engineer', company: 'Helium · gethelium.co', period: 'June 2024 – Oct 2024', points: [
      'Built Helium Glide, an AI-powered no-code visual editor for e-commerce, with a high-performance rendering engine using low-level React APIs.',
      'Integrated Helium Flare for AI-driven personalization.',
      'Migrated CSR to ISR, improving performance, scalability, and rendering efficiency for no-code generated applications.',
    ] },
    { role: 'Software Engineer Intern', company: 'Swiggy Instamart', period: 'Oct 2023 – June 2024', points: [
      'Improved IM Retails reliability with critical New Relic alerts, production monitoring, and code-quality measures.',
      'Migrated critical Picker workflows from Next.js to React Native and revamped the IM Retails UI.',
    ] },
    { role: 'Open Source Contributor', company: 'Google Summer of Code · ScoReLab', period: 'June 2022 – Sept 2022', points: [
      'Revamped Codelabz UI and architecture, modernizing its dependency stack and development environment to reduce development load time.',
      'Built high-performance serverless backend APIs with Firebase Cloud Functions.',
    ] },
  ],
  projects: [
    { name: 'Hardware Forensic Suite', blurb: 'Disk, memory, and network analysis in a hardware forensic suite.', stack: ['Disk analysis', 'Memory analysis', 'Network analysis'], outcome: 'Winner · Kavach 2023 Cyber Security Hackathon by AICTE, BPRD, and I4C', live: 'https://news.careers360.com/jmi-engineering-students-win-first-cyber-security-challenge', accent: '#e8b75d' },
    { name: 'WayFinder', blurb: 'LangChain-based agentic AI travel planner orchestrating research across Cleartrip, RedBus, Booking.com, Swiggy, Reddit, and web search.', stack: ['LangChain', 'Agentic AI'], outcome: 'Personalized, budget-optimized itineraries', live: 'https://x.com/sarf_alam0206/status/2086064709908996509', accent: '#7bc7ba' },
    { name: 'BLAH.JS', blurb: 'TypeScript UI rendering library with a custom compiler, parser, and VS Code extension.', stack: ['TypeScript', 'Compiler', 'Parser', 'VS Code'], outcome: 'Dynamic rendering and efficient DOM updates through ID-based element tracking', github: 'https://github.com/Sarfraz-droid/blah.js', accent: '#82aee4' },
    { name: 'Rolling The Dice', blurb: 'Research on strategic decision-making in LLMs using Monopoly to evaluate reasoning, planning, and long-term decision-making.', stack: ['LLMs', 'Reasoning', 'Planning'], live: 'https://links.sarfrazalam.in/rolling-the-dice', accent: '#b7a0e0' },
  ],
  education: [
    { title: 'B.Tech. · Electronics & Communication Engineering', org: 'Jamia Millia Islamia', period: 'July 2020 – July 2024', detail: '8.99 CGPA' },
    { title: 'Higher Secondary', org: 'Central Board of Secondary Education', period: '2020', detail: '92.6%' },
    { title: 'Secondary', org: 'Central Board of Secondary Education', period: '2018', detail: '84.8%' },
  ],
  about: {
    story: 'Volunteered at AGAMI and consulted developers building an Online Dispute Resolution (ODR) protocol.',
    interests: ['Open source · ScoReLab / Codelabz', 'LLM decision-making research', 'Online Dispute Resolution · AGAMI'],
  },
}
