import type { FaqItem, Plan } from "./types";

const trialEndDate = new Date();
trialEndDate.setDate(trialEndDate.getDate() + 7);
const day = trialEndDate.getDate();
const ordinal =
  day % 100 >= 11 && day % 100 <= 13
    ? "th"
    : ["th", "st", "nd", "rd"][Math.min(day % 10, 4)] ?? "th";
const trialDateStr =
  trialEndDate.toLocaleDateString("en-US", { month: "short" }) +
  ` ${day}${ordinal}`;

function makeAnnualPrice(monthlyPrice: number) {
  return Math.round(monthlyPrice * 0.8);
}

function annualNote(monthlyPrice: number) {
  return `billed at $${makeAnnualPrice(monthlyPrice) * 12}/year, starting ${trialDateStr}`;
}

export const PLANS: Plan[] = [
  {
    name: "Creator",
    description: "Perfect for content creators starting their journey.",
    ctaLabel: "Start 7-day trial",
    ctaHref: "/signup",
    monthlyPrice: 25,
    annualPrice: makeAnnualPrice(25),
    annualBillingNote: annualNote(25),
    features: [
      { label: "Full AI-powered editing" },
      { label: "5 active projects per month" },
      { label: "Natural language commands" },
      // { label: "1GB max file size", hasInfo: true },
      { label: "100GB cloud storage" },
      { label: "Automated captions" },
      { label: "Unlimited exports" },
      // { label: "Export to Premiere Pro & DaVinci Resolve" },
    ],
  },
  {
    name: "Pro",
    description: "Everything you need for professional production.",
    ctaLabel: "Start 7-day trial",
    ctaHref: "/signup",
    monthlyPrice: 100,
    annualPrice: makeAnnualPrice(100),
    annualBillingNote: annualNote(100),
    isFeatured: true,
    features: [
      { label: "Everything in Creator" },
      { label: "Unlimited projects" },
      { label: "Priority AI processing" },
      // { label: "5GB max file size", hasInfo: true },
      { label: "1TB cloud storage" },
      { label: "Priority 24/7 support" },
      { label: "Early access to new models" },
    ],
  },
  {
    name: "Teams",
    description: "Advanced features for collaborative video teams.",
    ctaLabel: "Contact us",
    ctaHref: "mailto:contact@reanimate.sh",
    customPrice: "Custom",
    customSubtext: "For organizations with specific needs",
    accent: "teams",
    features: [
      { label: "Everything in Creator & Pro" },
      { label: "Real-time collaboration" },
      { label: "Advanced project sharing" },
      { label: "SAML & SSO login" },
      { label: "Unlimited cloud storage" },
      { label: "Audit logs & history" },
      { label: "Dedicated account manager" },
      { label: "Custom contract & billing" },
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes, every new user gets a 7-day fully featured free trial of either the Creator or Pro plan. Credit card required to start.",
  },
  {
    question: "What happens after the trial?",
    answer:
      "Unless you choose to subscribe, your account will be limited and you won't be billed. We'll send you a reminder before your trial ends.",
  },
  {
    question: "Have another question?",
    answer:
      "If you have any other questions, feel free to reach out to us at contact@reanimate.sh or book a call. We're here to help!",
  },
];
