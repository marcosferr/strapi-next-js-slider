export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", env('FRONTEND_URL', 'http://localhost:3000')],
          'img-src': ["'self'", 'data:', 'blob:', env('FRONTEND_URL', 'http://localhost:3000')],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [env('FRONTEND_URL', 'http://localhost:3000')],
      headers: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
