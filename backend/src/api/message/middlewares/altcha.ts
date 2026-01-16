// backend/src/api/message/middlewares/altcha.ts
import { Core } from '@strapi/strapi';
import { createChallenge, verifySolution } from 'altcha-lib';

// Store for tracking used challenges (to prevent replay attacks)
const usedChallenges = new Set<string>();
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Cleanup old challenges periodically
setInterval(() => {
  usedChallenges.clear();
}, CHALLENGE_EXPIRY_MS);

/**
 * ALTCHA verification middleware
 * Validates proof-of-work tokens from the ALTCHA widget
 * Also validates honeypot field to catch bots
 */
export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const { body } = ctx.request;
    
    // Check honeypot field - if filled, it's likely a bot
    const honeypot = body.website || (body.data && body.data.website);
    if (honeypot) {
      strapi.log.warn('Honeypot field filled - likely a bot');
      // Return success to not alert the bot, but don't process
      return ctx.badRequest('Verification failed');
    }
    
    // Extract the ALTCHA payload from the request body
    // Frontend sends: { data: { ...fields }, altcha: "base64-encoded-payload" }
    const altchaPayload = body.altcha || (body.data && body.data.altcha);

    if (!altchaPayload) {
      return ctx.badRequest('ALTCHA verification is missing');
    }

    // Get HMAC key from environment
    const hmacKey = process.env.ALTCHA_HMAC_KEY;

    if (!hmacKey) {
      strapi.log.error('ALTCHA_HMAC_KEY is not defined');
      return ctx.internalServerError('Internal server error - ALTCHA not configured');
    }

    try {
      // Verify the ALTCHA solution
      const isValid = await verifySolution(altchaPayload, hmacKey);

      if (!isValid) {
        strapi.log.warn('ALTCHA verification failed');
        return ctx.badRequest('Invalid ALTCHA verification', { details: 'Verification failed' });
      }

      // Check for replay attacks
      const payloadHash = Buffer.from(altchaPayload).toString('base64');
      if (usedChallenges.has(payloadHash)) {
        strapi.log.warn('ALTCHA replay attack detected');
        return ctx.badRequest('Challenge already used');
      }
      usedChallenges.add(payloadHash);

      // Clean up the ALTCHA payload and honeypot from body.data
      if (body.data) {
        delete body.data.altcha;
        delete body.data.website;
      }
      delete body.altcha;
      delete body.website;

      await next();
    } catch (err) {
      strapi.log.error('ALTCHA verification error:', err);
      return ctx.internalServerError('ALTCHA verification failed');
    }
  };
};

/**
 * Generate a new ALTCHA challenge
 * This function can be exposed via a custom API endpoint
 */
export async function generateChallenge(): Promise<object> {
  const hmacKey = process.env.ALTCHA_HMAC_KEY;
  
  if (!hmacKey) {
    throw new Error('ALTCHA_HMAC_KEY is not configured');
  }

  const challenge = await createChallenge({
    hmacKey,
    maxNumber: 100000, // Adjust complexity as needed
    algorithm: 'SHA-256',
  });

  return challenge;
}
