import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://ntuwit-website.vercel.app";

type SeoDetails = {
  title: string;
  description: string;
  keywords: string;
};

const DEFAULT_KEYWORDS =
  "NTU Women in Tech, women in tech Singapore, women in technology, women in STEM, female tech leaders, NTU student club, Nanyang Technological University, Singapore tech community";

const PAGE_SEO: Record<string, SeoDetails> = {
  "/": {
    title: "NTU Women in Tech | Women in Technology Community Singapore",
    description:
      "NTU Women in Tech is a student-led women in technology community at NTU Singapore offering tech events, hackathons, mentorship and learning opportunities.",
    keywords: `${DEFAULT_KEYWORDS}, tech mentorship, student hackathons, coding events, diversity in technology`,
  },
  "/about": {
    title: "About NTU Women in Tech | Women in STEM Singapore",
    description:
      "Learn about NTU Women in Tech, a student community empowering women in technology and STEM through leadership, mentorship and inclusive opportunities.",
    keywords: `${DEFAULT_KEYWORDS}, women in STEM Singapore, diversity in tech, female student leadership, inclusive technology community`,
  },
  "/events": {
    title: "Women in Tech Events at NTU Singapore | NTU WIT",
    description:
      "Explore NTU Women in Tech events, including coding workshops, industry networking, mentorship, hackathons and community programmes for students.",
    keywords: `${DEFAULT_KEYWORDS}, women in tech events Singapore, coding workshops NTU, tech networking, student mentorship, technology events`,
  },
  "/beyond-binary": {
    title: "Beyond Binary Hackathon Singapore | NTU Women in Tech",
    description:
      "Discover Beyond Binary, NTU Women in Tech's student-run Singapore hackathon championing women, innovation, inclusive technology and emerging tech talent.",
    keywords: `${DEFAULT_KEYWORDS}, Beyond Binary hackathon, hackathon Singapore, women hackathon, student innovation, inclusive technology`,
  },
  "/projects": {
    title: "Technology Projects | NTU Women in Tech Singapore",
    description:
      "Explore technology projects by the NTU Women in Tech community, where students build practical skills, collaborate and create meaningful solutions.",
    keywords: `${DEFAULT_KEYWORDS}, student technology projects, women developers, collaborative coding, tech portfolio, student builders`,
  },
  "/recruit": {
    title: "Join NTU Women in Tech | Student Tech Community Singapore",
    description:
      "Join NTU Women in Tech and contribute through engineering, design, marketing, events or operations while connecting with an inclusive tech community.",
    keywords: `${DEFAULT_KEYWORDS}, join NTU Women in Tech, NTU CCA, women in tech membership, student tech club, tech volunteering Singapore`,
  },
};

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const details = PAGE_SEO[pathname];
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

    if (!details) {
      document.title = "Page Not Found | NTU Women in Tech";
      setMeta('meta[name="robots"]', "content", "noindex, nofollow");
      return;
    }

    document.title = details.title;
    setMeta('meta[name="description"]', "content", details.description);
    setMeta('meta[name="keywords"]', "content", details.keywords);
    setMeta('meta[name="robots"]', "content", "index, follow");
    setMeta('meta[property="og:title"]', "content", details.title);
    setMeta('meta[property="og:description"]', "content", details.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", details.title);
    setMeta(
      'meta[name="twitter:description"]',
      "content",
      details.description,
    );

    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", canonicalUrl);
  }, [pathname]);

  return null;
}
