import rateLimit from "express-rate-limit";

const json429 = { error: "Too many requests. Please slow down and try again later." };

// Broad protection against scraping/abuse across the whole API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429,
});

// Strict limit on payment initiation to prevent spam/charge abuse.
export const paymentCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429,
});

// Webhooks come from providers; keep generous but bounded.
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429,
});
