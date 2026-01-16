# POC Strapi + Next.js

Proyecto de prueba de concepto (POC) que integra un backend Strapi v5 con un frontend Next.js 16, utilizando PostgreSQL como base de datos y Docker para el despliegue del backend.

## Stack Tecnológico

- **Backend**: Strapi v5.31.3 con TypeScript
- **Frontend**: Next.js 16.0.8 con TypeScript
- **Base de datos**: PostgreSQL
- **Contenerización**: Docker y Docker Compose

## Funcionalidades

### Gestión de Contenido
- Content Types para artículos, autores, categorías, slides y contenido global
- Componentes compartidos (media, quote, rich-text, SEO, slider)
- Dynamic zones para composición flexible de contenido
- API RESTful con permisos públicos configurables

### Formulario de Contacto
- Página de contacto en `/contact` con formulario protegido por Cap.js (proof-of-work CAPTCHA)
- Validación del lado del servidor con middleware de Cap
- Envío automático de notificaciones por email al recibir mensajes
- Almacenamiento de mensajes en la base de datos con campos: nombre, email, consulta, fecha de recepción y anotaciones privadas
- Navegación integrada con enlaces a Inicio y Contacto

### Sistema de Email
- Integración con proveedor de email Nodemailer
- Envío automático de emails de notificación para nuevos mensajes de contacto
- Configurable vía variables de entorno

### Testing
- Suite de pruebas con Jest para validar funcionalidades críticas
- Pruebas automatizadas del middleware de Cap

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd poc-strapi
```

### 2. Configurar Variables de Entorno

#### Backend

Copia el archivo de entorno de ejemplo:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus configuraciones:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=<genera-claves-aleatorias-separadas-por-comas>
DATABASE_CLIENT=postgres
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
FRONTEND_URL=http://localhost:3000

# Bootstrap admin (estas variables son utilizadas por el script de seed)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrapiAdmin123!

# Cap.js (se obtienen del dashboard de Cap en http://localhost:3001)
CAP_API_URL=http://cap:3000
CAP_SITE_KEY=<tu-site-key-de-cap>
CAP_SECRET_KEY=<tu-secret-key-de-cap>
CAP_ADMIN_KEY=CapAdminKey12345

# Email
CONTACT_EMAIL=<email-destino-para-notificaciones>
DEFAULT_FROM_EMAIL=<email-remitente-predeterminado>
# Configuración SMTP (requerida para el envío de emails)
SMTP_HOST=<host-smtp>
SMTP_PORT=<puerto-smtp>
SMTP_USERNAME=<usuario-smtp>
SMTP_PASSWORD=<contraseña-smtp>
```

> **Nota**: Para generar las `APP_KEYS`, puedes ejecutar: `node -e "console.log(Array(4).fill(0).map(() => Math.random().toString(36).substring(2, 15)).join(','))"`

> **Importante**: Las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el archivo `.env` son utilizadas directamente por el script de seed para crear el usuario administrador. Puedes modificar estos valores según tus necesidades.

> **Configuración de Cap.js**: Inicia el servidor Cap con Docker Compose y accede al dashboard en http://localhost:3001 para crear un site key. El site key se usa en el frontend y el secret key en el backend.

> **Configuración de Email**: Para el envío de emails, configura las variables SMTP. El proyecto utiliza el proveedor Nodemailer de Strapi.

#### Frontend

Crea el archivo de entorno para el frontend:

```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:1337" > frontend/.env.local
echo "NEXT_PUBLIC_CAP_API_ENDPOINT=http://localhost:3001" >> frontend/.env.local
echo "NEXT_PUBLIC_CAP_SITE_KEY=<tu-site-key-de-cap>" >> frontend/.env.local
```

## Levantar el Proyecto por Primera Vez

### 1. Iniciar Base de Datos y Backend con Docker

```bash
docker-compose up -d
```

Este comando:
- Inicia un contenedor con PostgreSQL
- Construye e inicia el contenedor del backend Strapi
- Inicia el servidor Cap.js para verificación de CAPTCHA
- Configura las redes para que los contenedores puedan comunicarse

### 2. Esperar a que Strapi esté Listo

El primer inicio puede tardar varios minutos mientras Strapi:
- Construye el panel de administración
- Ejecuta las migraciones de la base de datos
- Configura los content types

Puedes verificar el estado con:

```bash
docker-compose logs -f backend
```

Cuando veas mensajes como `[2024-xx-xx xx:xx:xx.xxxx] info ⏰ Server is running on http://0.0.0.0:1337`, el backend está listo.

### 3. Ejecutar Seed de Datos Iniciales

Una vez que el backend esté funcionando, ejecuta el script de seed para poblar la base de datos con contenido de ejemplo:

```bash
cd backend
npm run seed:example
```

Este script:
- Crea un usuario administrador utilizando las credenciales definidas en `ADMIN_EMAIL` y `ADMIN_PASSWORD` del archivo `.env`
- Importa datos de ejemplo (artículos, categorías, autores, etc.)
- Configura permisos públicos para el acceso a la API
- Sube archivos multimedia de ejemplo

> **Importante**: El script de seed solo se ejecuta una vez por base de datos. Si necesitas volver a ejecutarlo, deberás reiniciar la base de datos.

### 4. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

### 5. Iniciar el Frontend

```bash
npm run dev
```

## Acceder a las Aplicaciones

Una vez completados todos los pasos:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:1337
- **Panel de Administración de Strapi**: http://localhost:1337/admin

### Credenciales de Administrador

El proceso de seed crea automáticamente un usuario administrador utilizando las credenciales definidas en el archivo `backend/.env`:

- **Email**: admin@example.com (o el valor definido en `ADMIN_EMAIL`)
- **Contraseña**: StrapiAdmin123! (o el valor definido en `ADMIN_PASSWORD`)

> **Nota**: Estas credenciales se leen directamente del archivo `.env` y se utilizan para crear el usuario administrador al ejecutar el comando `npm run seed:example`.

## Comandos Útiles

### Backend (Strapi)

```bash
cd backend

# Desarrollo con auto-recarga
npm run develop

# Modo producción
npm run start

# Construir panel de administración
npm run build

# Ejecutar pruebas
npm run test

# Importar datos de ejemplo (solo una vez)
npm run seed:example
```

### Frontend (Next.js)

```bash
cd frontend

# Servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Servidor de producción
npm run start

# Verificación de código
npm run lint
```

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart
```

## Estructura del Proyecto

```
poc-strapi/
├── backend/                 # Backend Strapi
│   ├── src/api/            # Definiciones de API y content types
│   │   ├── message/        # API de mensajes de contacto
│   │   │   ├── content-types/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/  # Middleware de Cap
│   │   │   ├── routes/
│   │   │   └── services/
│   ├── src/components/     # Componentes compartidos de Strapi
│   ├── data/               # Datos para seeding
│   ├── scripts/            # Scripts utilitarios (seed.js)
│   ├── tests/              # Pruebas con Jest
│   └── config/             # Configuración de Strapi
├── frontend/               # Frontend Next.js
│   ├── src/app/           # Páginas y layouts de Next.js
│   │   ├── contact/       # Página de contacto
│   ├── src/components/    # Componentes React
│   └── src/types/         # Definiciones de TypeScript
└── docker-compose.yml     # Configuración de Docker Compose
```

## Notas Importantes

- El backend se ejecuta dentro de un contenedor Docker, mientras que el frontend se ejecuta nativamente con npm
- El script de seed configura automáticamente los permisos públicos para todos los content types, incluyendo la creación de mensajes de contacto
- Los archivos multimedia para el seed se encuentran en `backend/data/uploads/`
- CORS está configurado para permitir solicitudes desde `FRONTEND_URL` (definido en el .env del backend)
- El script de seed ahora utiliza las variables de entorno `ADMIN_EMAIL` y `ADMIN_PASSWORD` para crear el usuario administrador
- El formulario de contacto incluye protección Cap.js (proof-of-work CAPTCHA) y envío automático de notificaciones por email
- Las pruebas se ejecutan con Jest y requieren que el servidor backend esté corriendo en el puerto 1337

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**
   - Asegúrate de que PostgreSQL está corriendo: `docker-compose ps`
   - Verifica las credenciales en `backend/.env`

2. **Error de CORS en el frontend**
   - Verifica que `FRONTEND_URL` en `backend/.env` coincida con la URL del frontend
   - Reinicia el contenedor del backend después de cambiar la configuración

3. **El seed no funciona**
   - Asegúrate de que el backend esté completamente iniciado antes de ejecutar el seed
   - Verifica los logs del backend para ver si hay errores
   - Asegúrate de que las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén definidas en el archivo `.env`

4. **El frontend no se conecta al backend**
   - Verifica que `NEXT_PUBLIC_API_BASE_URL` en `frontend/.env.local` sea correcto
   - Asegúrate de que ambos servicios estén corriendo

5. **Error con Cap.js**
   - Verifica que el servidor Cap esté corriendo: `docker-compose ps`
   - Accede al dashboard de Cap en http://localhost:3001 y crea un site key
   - Asegúrate de que `NEXT_PUBLIC_CAP_SITE_KEY` y `CAP_SECRET_KEY` estén definidos

6. **Los emails no se envían**
   - Configura las variables SMTP en `backend/.env`
   - Verifica que el proveedor de email esté correctamente configurado en Strapi

### Reiniciar Todo

Si necesitas empezar desde cero:

```bash
# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Volver a iniciar todo
docker-compose up -d

# Esperar y ejecutar seed
cd backend && npm run seed:example

# Iniciar frontend
cd ../frontend && npm run dev
```

## Contribución

1. Fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.