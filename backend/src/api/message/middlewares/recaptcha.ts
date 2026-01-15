// backend/src/api/message/middlewares/recaptcha.ts
import { Core } from '@strapi/strapi';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const { body } = ctx.request;
    
    // We expect the token to be sent in a specific property, e.g., 'recaptchaToken'
    // It could be at the root of the body or inside 'data'. 
    // Let's assume the frontend sends: { data: { ...fields }, recaptchaToken: "..." }
    const recaptchaToken = body.recaptchaToken || (body.data && body.data.recaptchaToken);

    if (!recaptchaToken) {
      return ctx.badRequest('Recaptcha token is missing');
    }

    const secretKey = process.env.SECRET_BACKEND_RECAPTCHA || "6Lex0UssAAAAADxSg0xxom99MQ4RLLQtKA1g02Um";

    if (!secretKey) {
      strapi.log.error('SECRET_BACKEND_RECAPTCHA is not defined');
      return ctx.internalServerError('Internal server error');
    }

    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
      const response = await fetch(verifyUrl, { method: 'POST' });
      const data = await response.json() as any;

      if (!data.success) {
        return ctx.badRequest('Invalid Recaptcha', { details: data['error-codes'] });
      }

      // If valid, cleanse the token from body.data if it exists there, so Strapi doesn't complain about unknown field
      if (body.data && body.data.recaptchaToken) {
        delete body.data.recaptchaToken;
      }
      // Also remove from root if we want to be clean, though usually harmless
      delete body.recaptchaToken;

      await next();
    } catch (err) {
      strapi.log.error('Recaptcha verification error:', err);
      return ctx.internalServerError('Recaptcha verification failed');
    }
  };
};
