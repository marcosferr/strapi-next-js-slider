import type { Core } from '@strapi/strapi';

const ensureAdminAccount = async (strapi: Core.Strapi) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    strapi.log.warn('ADMIN_EMAIL or ADMIN_PASSWORD missing; skipping admin bootstrap');
    return;
  }

  const existing = await strapi.query('admin::user').findOne({ where: { email } });
  if (existing) {
    return;
  }

  const superAdminRole = await strapi.query('admin::role').findOne({ where: { code: 'strapi-super-admin' } });
  if (!superAdminRole) {
    strapi.log.error('Super admin role not found; cannot create bootstrap admin user');
    return;
  }

  await strapi.query('admin::user').create({
    data: {
      email,
      password,
      firstname: 'Admin',
      lastname: 'User',
      roles: [superAdminRole.id],
      isActive: true,
    },
  });

  strapi.log.info(`Admin user created for ${email}`);
};

const allowPublicSlideRead = async (strapi: Core.Strapi) => {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!publicRole) {
    strapi.log.warn('Public role not found; cannot set slide permissions');
    return;
  }

  const actions = ['find', 'findOne'];
  for (const action of actions) {
    const permissionAction = `api::slide.slide.${action}`;
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: { action: permissionAction, role: publicRole.id },
    });

    if (existing) {
      if (!existing.enabled) {
        await strapi.db.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
      continue;
    }

    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action: permissionAction,
        role: publicRole.id,
        enabled: true,
      },
    });
  }

  strapi.log.info('Public role granted read access to slides');
};

const allowPublicMessageCreate = async (strapi: Core.Strapi) => {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!publicRole) {
    strapi.log.warn('Public role not found; cannot set message permissions');
    return;
  }

  const action = 'create';
  const permissionAction = `api::message.message.${action}`;
  
  const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
    where: { action: permissionAction, role: publicRole.id },
  });

  if (existing) {
    if (!existing.enabled) {
      await strapi.db.query('plugin::users-permissions.permission').update({
        where: { id: existing.id },
        data: { enabled: true },
      });
      strapi.log.info('Public role re-enabled creation access to messages');
    }
    return;
  }

  await strapi.db.query('plugin::users-permissions.permission').create({
    data: {
      action: permissionAction,
      role: publicRole.id,
      enabled: true,
    },
  });

  strapi.log.info('Public role granted creation access to messages');
};

const seedSlides = async (strapi: Core.Strapi) => {
  const existing = await strapi.db.query('api::slide.slide').findMany();
  if (existing.length > 0) {
    return;
  }

  const slides = [
    {
      title: 'Launch faster',
      description: 'Ship your MVP with a Strapi backend and a clean Next.js carousel.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
      ctaUrl: 'https://strapi.io',
      order: 1,
    },
    {
      title: 'Editable content',
      description: 'Manage slides in Strapi with draft/publish and preview-friendly fields.',
      imageUrl: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=1200&q=80',
      ctaUrl: 'https://nextjs.org',
      order: 2,
    },
    {
      title: 'Composable stack',
      description: 'Keep frontend and backend isolated while iterating quickly.',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ctaUrl: 'https://github.com/strapi/strapi',
      order: 3,
    },
  ];

  for (const slide of slides) {
    await strapi.entityService.create('api::slide.slide', {
      data: { ...slide, publishedAt: new Date() },
    });
  }

  strapi.log.info('Seeded carousel slides');
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureAdminAccount(strapi);
    await allowPublicSlideRead(strapi);
    await allowPublicMessageCreate(strapi);
    await seedSlides(strapi);
  },
};
