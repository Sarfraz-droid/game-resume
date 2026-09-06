/* ════════════════════════════════════════════════════════════════════════════
   ✏️  EDIT EVERYTHING HERE — this is the only file you normally touch.

   The 3D world, the pop-up panels, the persistent menu and the plain-text
   fallback résumé are all generated from this object.
   ════════════════════════════════════════════════════════════════════════════ */

export const RESUME = {
  profile: {
    name: 'Sarfraz Alam',            // [Your Name]
    role: 'Software Engineer',        // [Role / Profession]
    // [Short bio]
    bio: 'I build playful, well-crafted software — from tidy APIs to interactive 3D toys like this one. I care about clean interfaces, fast feedback loops, and actually shipping.',
    location: 'Your City · open to remote',
    facts: [
      'N+ years building web & product software',
      'Full-stack, happiest near the frontend',
      'Small teams, real ownership',
    ],
  },

  // [Résumé PDF URL] — drop a file in /public and use "/resume.pdf", or paste a link.
  resumeUrl: '',

  contact: {
    email: 'alamsarfraz422@gmail.com',                 // [Email]
    linkedin: 'https://www.linkedin.com/in/your-handle', // [LinkedIn URL]
    github: 'https://github.com/your-handle',            // [GitHub URL]
  },

  // [Skills]
  skills: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'three.js / R3F', 'CSS', 'Vite'] },
    { group: 'Backend', items: ['Node', 'PostgreSQL', 'REST', 'GraphQL', 'Redis'] },
    { group: 'Platform', items: ['Docker', 'AWS', 'CI/CD', 'Terraform', 'Observability'] },
  ],

  // [Work experience]
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Company A',
      period: '2023 — Present',
      points: [
        'Led the rebuild of X; cut page load from Ns to Ns.',
        'Own the Y service end-to-end (~M requests/day).',
        'Mentor 3 engineers and run the frontend guild.',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'Company B',
      period: '2020 — 2023',
      points: [
        'Shipped the Z feature, adopted by K% of customers.',
        'Introduced end-to-end tests; halved production regressions.',
      ],
    },
    {
      role: 'Junior Developer',
      company: 'Company C',
      period: '2018 — 2020',
      points: ['Built internal tools and dashboards used across the company.'],
    },
  ],

  // [Projects]
  projects: [
    {
      name: 'Project One',
      blurb: 'A short, punchy description of what it is and why it matters.',
      stack: ['React', 'Node', 'PostgreSQL'],
      outcome: '10k+ users · featured on ProductHunt',
      github: 'https://github.com/your-handle/project-one',
      live: 'https://project-one.example.com',
      accent: '#e06c5a',
    },
    {
      name: 'Project Two',
      blurb: 'Another project. Keep each blurb to a sentence or two.',
      stack: ['TypeScript', 'three.js', 'WebGL'],
      outcome: 'Open-source · 800 stars',
      github: 'https://github.com/your-handle/project-two',
      live: '',
      accent: '#4c9f70',
    },
    {
      name: 'Résumé Island',
      blurb: 'This site — an explorable low-poly world built with React + react-three-fiber.',
      stack: ['React', 'R3F', 'drei', 'Vite'],
      outcome: 'You are standing in it.',
      github: 'https://github.com/your-handle/resume-island',
      live: '',
      accent: '#6c8ea4',
    },
  ],

  // [Education]
  education: [
    {
      title: 'B.S. in Computer Science',
      org: 'Your University',
      period: '20XX',
      detail: 'Coursework: Algorithms, Distributed Systems, Graphics, HCI.',
    },
    {
      title: 'Certifications',
      org: 'Various',
      period: '',
      detail: 'AWS Solutions Architect · relevant courses & bootcamps here.',
    },
  ],

  about: {
    story:
      'Outside of work I tinker with generative art, ride bikes, and over-engineer my coffee setup. I like teaching, small tools, and puzzles with a satisfying click.',
    interests: ['Generative art', 'Cycling', 'Mechanical keyboards', 'Board games', 'Coffee'],
  },
}
