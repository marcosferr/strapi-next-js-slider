export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data) {
      data.fechaRecibida = new Date();
    }
  },

  async afterCreate(event) {
    const { result } = event;

    try {
      await strapi.plugins['email'].services.email.send({
        to: process.env.CONTACT_EMAIL || process.env.DEFAULT_FROM_EMAIL || 'admin@example.com',
        from: process.env.DEFAULT_FROM_EMAIL || 'no-reply@example.com',
        subject: `Contacto WEB - ${result.nombre}`,
        text: `Nuevo mensaje de contacto:\n\nNombre: ${result.nombre}\nEmail: ${result.email}\nConsulta: ${result.consulta}`,
        html: `<p>Nuevo mensaje de contacto:</p>
               <p><strong>Nombre:</strong> ${result.nombre}</p>
               <p><strong>Email:</strong> ${result.email}</p>
               <p><strong>Consulta:</strong> ${result.consulta}</p>`,
      });
    } catch (err) {
      console.log('Error sending email:', err);
    }
  },
};
