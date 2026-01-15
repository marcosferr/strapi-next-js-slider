export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('EMAIL_HOST', 'smtp.office365.com'),
        port: env.int('EMAIL_PORT', 587),
        auth: {
          user: env('EMAIL_HOST_USER'),
          pass: env('EMAIL_HOST_PASSWORD'),
        },
        // Secure is false for port 587 (STARTTLS)
        secure: env.bool('EMAIL_USE_SSL', false),
        requireTLS: env.bool('EMAIL_USE_TLS', true), 
        tls: {
          ciphers: 'SSLv3'
        }
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM_EMAIL'),
        defaultReplyTo: env('DEFAULT_FROM_EMAIL'),
      },
    },
  },
});
