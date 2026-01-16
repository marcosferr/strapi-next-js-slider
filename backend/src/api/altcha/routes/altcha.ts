/**
 * ALTCHA challenge routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/altcha/challenge',
      handler: 'altcha.getChallenge',
      config: {
        auth: false, // Public endpoint - no authentication required
        policies: [],
        middlewares: [],
      },
    },
  ],
};
