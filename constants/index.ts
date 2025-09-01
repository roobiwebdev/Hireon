import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "TailwindCSS",
    ],
    level: "Junior",
    questions: [
      "What is React?",
      "Explain component lifecycle",
      "What is JSX?",
    ],
    finalized: false,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user2",
    role: "Backend Developer",
    type: "Technical",
    techstack: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "Redis"],
    level: "Intermediate",
    questions: [
      "What is Node.js?",
      "Explain REST APIs",
      "Database design principles",
    ],
    finalized: false,
    createdAt: "2025-01-14T15:30:00Z",
  },
  {
    id: "3",
    userId: "user3",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["React", "Next.js", "Node.js", "Express.js", "MongoDB", "AWS"],
    level: "Senior",
    questions: [
      "System architecture",
      "Scalability patterns",
      "Full-stack best practices",
    ],
    finalized: false,
    createdAt: "2025-01-13T09:15:00Z",
  },
  {
    id: "4",
    userId: "user4",
    role: "DevOps & Cloud Engineer",
    type: "Technical",
    techstack: ["AWS", "Docker", "Kubernetes", "Terraform", "Bash"],
    level: "Senior",
    questions: [
      "CI/CD pipelines",
      "Container orchestration",
      "Infrastructure as Code",
    ],
    finalized: false,
    createdAt: "2025-01-12T14:20:00Z",
  },
  {
    id: "5",
    userId: "user5",
    role: "Mobile App Developer",
    type: "Technical",
    techstack: ["React Native", "Flutter", "Kotlin", "Swift", "Firebase"],
    level: "Intermediate",
    questions: [
      "Explain mobile app architecture",
      "Cross-platform development challenges",
      "Mobile performance optimization",
    ],
    finalized: false,
    createdAt: "2025-01-11T11:45:00Z",
  },
  {
    id: "6",
    userId: "user6",
    role: "System Design Engineer",
    type: "Technical",
    techstack: ["Java", "Go", "PostgreSQL", "Redis", "AWS"],
    level: "Senior",
    questions: [
      "Design a URL shortener",
      "Design a chat system",
      "Database sharding strategies",
    ],
    finalized: false,
    createdAt: "2025-01-10T16:30:00Z",
  },
  {
    id: "7",
    userId: "user7",
    role: "Business Analyst",
    type: "Mixed",
    techstack: ["SQL", "Excel", "Power BI", "Tableau", "Jira"],
    level: "Intermediate",
    questions: [
      "Requirements gathering",
      "Data analysis",
      "Process improvement",
    ],
    finalized: false,
    createdAt: "2025-01-09T13:15:00Z",
  },
  {
    id: "8",
    userId: "user8",
    role: "Data Engineer",
    type: "Technical",
    techstack: ["Python", "SQL", "Apache Spark", "Kafka", "AWS Redshift"],
    level: "Senior",
    questions: [
      "Data pipeline design",
      "ETL process optimization",
      "Big data processing strategies",
    ],
    finalized: false,
    createdAt: "2025-01-08T10:30:00Z",
  },
  {
    id: "9",
    userId: "user9",
    role: "Cybersecurity Specialist",
    type: "Technical",
    techstack: [
      "Linux",
      "Wireshark",
      "Metasploit",
      "Firewall Tools",
      "Encryption Standards",
    ],
    level: "Senior",
    questions: [
      "Security vulnerabilities",
      "Incident response",
      "Risk assessment",
    ],
    finalized: false,
    createdAt: "2025-01-07T08:45:00Z",
  },
];
