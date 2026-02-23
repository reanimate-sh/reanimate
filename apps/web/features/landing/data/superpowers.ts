export const STEPS = [
  {
    prompt: "Add a narrator voiceover.",
    activeCard: "Voiceover",
  },
  {
    prompt: "Zoom into the pricing card.",
    activeCard: "Smart Zoom",
  },
  {
    prompt: "Pan to the API section.",
    activeCard: "Screen Pan",
  },
  {
    prompt: "Cut this down to 30s.",
    activeCard: "Smart Trim",
  },
  {
    prompt: "Add a click ripple on submit.",
    activeCard: "Click Ripple",
  },
];

export const CUSTOMERS = [
  { name: "Amazon", slug: "amazon", ext: "svg", height: 32, url: "https://amazon.com" },
  { name: "Microsoft", slug: "microsoft", ext: "svg", height: 32, url: "https://microsoft.com" },
  { name: "LinkedIn", slug: "linkedin", ext: "svg", height: 32, url: "https://linkedin.com" },
  { name: "Flipkart", slug: "flipkart", ext: "png", height: 36, filter: "invert(1)", url: "https://flipkart.com" },
  { name: "PhonePe", slug: "phonepe", ext: "webp", height: 36, filter: "brightness(0) invert(1)", url: "https://phonepe.com" },
  { name: "Ideavo", slug: "ideavo", ext: "png", height: 24, url: "https://ideavo.ai" },
  { name: "OpenBrowser", slug: "openbrowser", ext: "png", height: 20, url: "https://openbrowser.tech" },
  { name: "Treaps", slug: "treaps", ext: "png", height: 22, url: "https://treaps.com" },
  { name: "Sarvam", slug: "sarvam", ext: "svg", height: 20, filter: "brightness(0) invert(1)", url: "https://sarvam.ai" },
  { name: "Cred", slug: "cred", ext: "png", height: 32, filter: "invert(1)", url: "https://cred.club" },
];

export const CAROUSEL_VIDEOS = [
  { src: "/videos/intro.mp4", title: "Launch videos", description: "Pitch your product in style.", portrait: false },
  { src: "/videos/compilation.mp4", title: "Feature compilation", description: "Showcase multiple features of your app", portrait: false },
  { src: "/videos/promo.mp4", title: "Promo", description: "Build hype and drive action.", portrait: false },
  { src: "/videos/explainer.mp4", title: "Explainers", description: "Break down complex topics with clear visuals.", portrait: false },
  { src: "/videos/feature.mp4", title: "Feature launch", description: "Launch a new feature in style.", portrait: false }
];
