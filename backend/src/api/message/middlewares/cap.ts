// backend/src/api/message/middlewares/cap.ts
import { Core } from '@strapi/strapi';

/**
 * Cap.js CAPTCHA verification middleware
 * Validates proof-of-work tokens from the Cap.js widget
 */
export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const { body } = ctx.request;
    
    // Extract the cap token from the request body
    // Frontend sends: { data: { ...fields }, capToken: "..." }
    const capToken = body.capToken || (body.data && body.data.capToken);

    if (!capToken) {
      return ctx.badRequest('Cap token is missing');
    }

    // Cap standalone server configuration
    const capApiUrl = process.env.CAP_API_URL || 'http://localhost:3001';
    const capSiteKey = process.env.CAP_SITE_KEY;
    const capSecretKey = process.env.CAP_SECRET_KEY;

    if (!capSiteKey || !capSecretKey) {
      strapi.log.error('CAP_SITE_KEY or CAP_SECRET_KEY is not defined');
      return ctx.internalServerError('Internal server error - Cap not configured');
    }

    try {
      // Verify the token with Cap standalone server
      const verifyUrl = `${capApiUrl}/${capSiteKey}/siteverify`;
      
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: capSecretKey,
          response: capToken,
        }),
      });

      const data = await response.json() as { success: boolean; error?: string };

      if (!data.success) {
        strapi.log.warn('Cap verification failed:', data);
        return ctx.badRequest('Invalid Cap token', { details: data.error || 'Verification failed' });
      }

      // Clean up the token from body.data if it exists there
      if (body.data && body.data.capToken) {
        delete body.data.capToken;
      }
      delete body.capToken;

      await next();
    } catch (err) {
      strapi.log.error('Cap verification error:', err);
      return ctx.internalServerError('Cap verification failed');
    }
  };
};
