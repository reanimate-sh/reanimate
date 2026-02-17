export const STEPS = [
  {
    prompt: "Cut the awkward pauses.",
    activeCard: "Silence Removal",
  },
  {
    prompt: "Make this look more cinematic.",
    activeCard: "Color Grade",
  },
  {
    prompt: "Add captions in English.",
    activeCard: "Captions",
  },
  {
    prompt: "Add a narrator voiceover.",
    activeCard: "Voiceover",
  },
  {
    prompt: "Cut this down to 30s.",
    activeCard: "Smart Trim",
  },
];

export const SEARCH_STEPS = [
  {
    query: "audience laughs",
    results: [
      { name: "IMG_4829.mov", time: "02:14", active: false },
      { name: "Audience_Laugh.mp4", time: "04:12", active: true },
      { name: "IMG_4831.mov", time: "01:05", active: false },
    ],
  },
  {
    query: "car horn",
    results: [
      { name: "IMG_4829.mov", time: "02:14", active: false },
      { name: "Traffic_Horn.wav", time: "01:05", active: true },
      { name: "IMG_4830.mov", time: "04:12", active: false },
    ],
  },
  {
    query: "crowd cheering",
    results: [
      { name: "Crowd_Cheer.mp4", time: "03:22", active: true },
      { name: "IMG_4830.mov", time: "04:12", active: false },
      { name: "IMG_4831.mov", time: "01:05", active: false },
    ],
  },
];

export const CUSTOMERS = [
  { name: "Autumn", slug: "autumn", url: "https://autumnai.com" },
  { name: "General Legal", slug: "general-legal", url: "https://general.legal" },
  { name: "Hyperspell", slug: "hyperspell", url: "https://hyperspell.com" },
  { name: "Oolka", slug: "oolka", url: "https://oolka.in" },
  { name: "Oximy", slug: "oximy", url: "https://oximy.com" },
  { name: "PostHog", slug: "posthog", url: "https://posthog.com" },
  { name: "Shopos", slug: "shopos", url: "https://shopos.ai" },
];

export const CAROUSEL_VIDEOS = [
  { src: "/videos/talking-head-ishan-1.mp4", title: "Talking heads", description: "Framing + Captions in seconds.", portrait: false },
  { src: "/videos/vlog-trim.mp4", title: "Vlogs", description: "Automatically creates stories out of your footage.", portrait: true },
  { src: "/videos/montage-trim.mp4", title: "Montages", description: "Punchy edits that land on the beat.", portrait: false },
  { src: "/videos/gl-trim.mp4", title: "Launch Videos", description: "Pitch your product in style.", portrait: false },
  { src: "/videos/shopos-explainer-1.mp4", title: "Explainers", description: "Break down complex topics with clear visuals.", portrait: true },
];
