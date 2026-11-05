import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

/**
 * SOURCE OF TRUTH KEYWORDS: getTechLogoUrl, devicon, tech logo, tech icon url, mappings, techstack
 * WHAT:  Builds the devicon SVG URL for a tech name ("Next.js" → nextjs-original.svg).
 * WHY:   One place turns a tech name into a logo, so the dashboard and landing page agree.
 *        It does not check that the icon exists; getTechLogos adds that check.
 * WHERE: getTechLogos below, components/landing/TechMarquee.tsx.
 */
export const getTechLogoUrl = (tech: string) => {
  const normalized = normalizeTechName(tech);
  return `${techIconBaseURL}/${normalized}/${normalized}-original.svg`;
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => ({ tech, url: getTechLogoUrl(tech) }));

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
