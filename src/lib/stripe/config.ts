import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: undefined as string | undefined,
    features: ["10 practice questions/day", "1 mock exam/month", "Basic progress tracking"],
  },
  pro_trade: {
    name: "Pro — Single Trade",
    price: 29,
    priceId: process.env.STRIPE_PRO_TRADE_PRICE_ID,
    features: ["Unlimited practice", "Unlimited mock exams", "Full learning path", "Flashcards & audio lessons"],
  },
  pro_all: {
    name: "Pro — All Trades",
    price: 49,
    priceId: process.env.STRIPE_PRO_ALL_PRICE_ID,
    features: ["All trades", "Everything in Pro", "Priority support"],
  },
  org_seat: {
    name: "Instructor — 30 Seats",
    price: 399,
    priceId: process.env.STRIPE_ORG_SEAT_PRICE_ID,
    features: ["30 apprentice seats", "Instructor dashboard", "Readiness monitoring", "Class weak-area reports"],
  },
} as const;
