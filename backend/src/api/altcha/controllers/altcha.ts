/**
 * ALTCHA controller
 * Provides challenge generation endpoint for the ALTCHA widget
 */

import { createChallenge } from 'altcha-lib';

export default {
  async getChallenge(ctx: any) {
    const hmacKey = process.env.ALTCHA_HMAC_KEY;

    if (!hmacKey) {
      strapi.log.error('ALTCHA_HMAC_KEY is not defined');
      return ctx.internalServerError('ALTCHA not configured');
    }

    try {
      // Generate a new challenge with expiration
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      const challenge = await createChallenge({
        hmacKey,
        maxNumber: 100000,
        algorithm: 'SHA-256',
        expires: expiresAt,
      });

      ctx.body = challenge;
    } catch (err) {
      strapi.log.error('Failed to generate ALTCHA challenge:', err);
      return ctx.internalServerError('Failed to generate challenge');
    }
  },
};
