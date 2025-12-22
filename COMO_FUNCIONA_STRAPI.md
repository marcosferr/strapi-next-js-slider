# ¿Cómo funciona Strapi? - Elementos Principales

## ¿Qué es Strapi?

Strapi es un **Headless CMS (Content Management System)** de código abierto que permite crear y gestionar contenido de forma flexible a través de una interfaz de administración, mientras que el contenido se entrega a través de APIs REST o GraphQL. Esto significa que Strapi se encarga de la gestión de contenido, pero deja la libertad de elegir cualquier tecnología frontend para consumir ese contenido.

## Arquitectura Principal

Strapi sigue una arquitectura basada en Node.js que se organiza en los siguientes componentes fundamentales:

### 1. **Backend (API Layer)**

El backend de Strapi es responsable de:
- Gestionar el contenido a través de una interfaz de administración
- Exponer APIs REST y GraphQL automáticamente
- Manejar autenticación y permisos
- Procesar archivos y medios
- Gestionar la base de datos

En este proyecto, el backend se encuentra en la carpeta [`backend/`](backend/) y está configurado con:
- **Node.js** y **TypeScript** como base
- **PostgreSQL** como base de datos (configurado en [`backend/config/database.ts`](backend/config/database.ts:1))
- **Docker** para contenerización (definido en [`docker-compose.yml`](docker-compose.yml:1))

### 2. **Content Types (Tipos de Contenido)**

Los Content Types son las estructuras de datos que definen cómo se organiza el contenido. Una de las características más potentes de Strapi es que **puedes crear Content Types directamente desde la interfaz de usuario (UI)** sin necesidad de escribir código.

#### Creación de Content Types desde la UI

En el panel de administración de Strapi puedes:
1. Navegar a **Content-Type Builder** en el menú lateral
2. Hacer clic en **"Create new collection type"** o **"Create new single type"**
3. Definir el nombre y campos del Content Type utilizando una interfaz visual
4. Seleccionar diferentes tipos de campos (text, number, relation, media, etc.)
5. Configurar validaciones y opciones específicas para cada campo

Una vez creado el Content Type desde la UI, Strapi automáticamente:
- Genera los archivos JSON del schema (como los que vemos en el proyecto)
- Crea los endpoints CRUD automáticamente
- Actualiza la base de datos con las nuevas tablas
- Añade el Content Type al menú de contenido

#### Ejemplos de Content Types en este proyecto:

Aunque estos Content Types podrían haberse creado desde la UI, en este proyecto podemos observar varios ejemplos:

#### Article ([`backend/src/api/article/content-types/article/schema.json`](backend/src/api/article/content-types/article/schema.json:1))
```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "text" },
    "slug": { "type": "uid" },
    "cover": { "type": "media" },
    "author": { "type": "relation" },
    "category": { "type": "relation" },
    "blocks": { "type": "dynamiczone" }
  }
}
```

#### Author ([`backend/src/api/author/content-types/author/schema.json`](backend/src/api/author/content-types/author/schema.json:1))
```json
{
  "kind": "collectionType",
  "collectionName": "authors",
  "attributes": {
    "name": { "type": "string" },
    "avatar": { "type": "media" },
    "email": { "type": "string" },
    "articles": { "type": "relation" }
  }
}
```

### 3. **Components (Componentes Reutilizables)**

Al igual que los Content Types, **los Components también pueden crearse directamente desde la interfaz de usuario** de Strapi. Esto permite a los usuarios no técnicos construir bloques de contenido complejos sin escribir código.

#### Creación de Components desde la UI

En el panel de administración puedes:
1. Ir a **Content-Type Builder**
2. Seleccionar la pestaña **"Components"**
3. Hacer clic en **"Create new component"**
4. Elegir una categoría (como "shared" para componentes globales)
5. Definir los campos del componente utilizando la interfaz visual
6. Reutilizar estos componentes en múltiples Content Types

Los Components son bloques de contenido reutilizables que pueden ser utilizados en múltiples Content Types. En este proyecto encontramos:

- **Rich Text** ([`backend/src/components/shared/rich-text.json`](backend/src/components/shared/rich-text.json:1)): Para contenido de texto enriquecido
- **Slider** ([`backend/src/components/shared/slider.json`](backend/src/components/shared/slider.json:1)): Para galerías de imágenes
- **Media** ([`backend/src/components/shared/media.json`](backend/src/components/shared/media.json:1)): Para archivos multimedia
- **Quote** ([`backend/src/components/shared/quote.json`](backend/src/components/shared/quote.json:1)): Para citas
- **SEO** ([`backend/src/components/shared/seo.json`](backend/src/components/shared/seo.json:1)): Para metadatos SEO

### 4. **API Layer (Capa de API)**

Strapi genera automáticamente endpoints REST y GraphQL para cada Content Type. La estructura incluye:

- **Controllers** ([`backend/src/api/article/controllers/article.ts`](backend/src/api/article/controllers/article.ts:1)): Manejan la lógica de las peticiones HTTP
- **Services** ([`backend/src/api/article/services/article.ts`](backend/src/api/article/services/article.ts:1)): Contienen la lógica de negocio
- **Routes** ([`backend/src/api/article/routes/article.ts`](backend/src/api/article/routes/article.ts:1)): Definen las rutas de la API

### 5. **Admin Panel (Panel de Administración)**

Strapi proporciona un panel de administración personalizable donde los usuarios pueden:
- Crear y editar contenido
- Gestionar usuarios y permisos
- Configurar la aplicación
- Ver estadísticas

### 6. **Frontend (Aplicación Cliente)**

Aunque Strapi es "headless" (sin frontend propio), este proyecto incluye una aplicación frontend de ejemplo construida con **Next.js** en la carpeta [`frontend/`](frontend/). Este frontend consume la API de Strapi para mostrar el contenido.

## Flujo de Trabajo Típico

1. **Definición del Modelo de Datos**: Se crean los Content Types y Components necesarios (desde la UI o código)
2. **Configuración de la API**: Strapi genera automáticamente los endpoints
3. **Gestión de Contenido**: Los administradores utilizan el panel de administración para crear contenido
4. **Consumo del Contenido**: Las aplicaciones frontend consumen la API para mostrar el contenido

## Ventajas de la Creación Visual de Content Types

La capacidad de crear Content Types y Components desde la interfaz de usuario ofrece varias ventajas importantes:

- **Accesibilidad para no programadores**: Los equipos de contenido pueden definir sus propias estructuras sin necesidad de conocimientos técnicos
- **Desarrollo más rápido**: No hay que escribir código boilerplate para cada nuevo tipo de contenido
- **Iteración ágil**: Los cambios en el modelo de datos se pueden hacer y probar inmediatamente
- **Consistencia**: La interfaz visual asegura que se sigan las mejores prácticas de Strapi
- **Sincronización automática**: Los cambios se reflejan inmediatamente en la API y la base de datos

## Cuándo Usar Código vs UI

Aunque la UI es muy poderosa, hay situaciones donde preferir definir Content Types mediante código:

- **Control de versiones**: Los archivos JSON pueden ser versionados con Git
- **Entornos múltiples**: Facilita la replicación entre desarrollo, staging y producción
- **Configuraciones complejas**: Algunas configuraciones avanzadas pueden requerir edición manual
- **Automatización**: Permite generar Content Types programáticamente

## Características Principales

### 1. **Headless by Design**
- Separación completa entre backend y frontend
- Libertad para elegir cualquier tecnología frontend
- Contenido accesible a través de APIs estándar

### 2. **Auto-generación de APIs**
- Cada Content Type genera automáticamente endpoints CRUD
- Soporte para REST y GraphQL
- Documentación automática de la API

### 3. **Base de Datos Flexible**
- Soporte para múltiples bases de datos (PostgreSQL, MySQL, SQLite, MongoDB)
- Migraciones automáticas de esquema
- Gestión de relaciones entre entidades

### 4. **Sistema de Permisos**
- Control de acceso granular
- Roles y permisos configurables
- Autenticación integrada

### 5. **Personalización Extensible**
- Sistema de plugins para extender funcionalidades
- Posibilidad de personalizar controllers, services y routes
- Componentes dinámicos y zonas dinámicas

### 6. **Media Management**
- Gestión integrada de archivos multimedia
- Soporte para imágenes, videos y documentos
- Optimización automática de imágenes

## Estructura de Carpetas del Proyecto

```
poc-strapi/
├── backend/                 # Aplicación Strapi
│   ├── config/             # Configuración de la aplicación
│   ├── data/               # Datos iniciales y uploads
│   ├── src/
│   │   ├── api/            # Definición de APIs y Content Types
│   │   ├── components/     # Componentes reutilizables
│   │   └── admin/          # Configuración del panel de administración
│   └── package.json        # Dependencias del backend
├── frontend/               # Aplicación frontend (Next.js)
│   ├── src/
│   │   ├── app/            # Páginas de Next.js
│   │   └── components/     # Componentes React
│   └── package.json        # Dependencias del frontend
└── docker-compose.yml      # Configuración de contenedores Docker
```

## Conclusión

Strapi es una plataforma poderosa y flexible que simplifica enormemente el desarrollo de aplicaciones basadas en contenido. Su arquitectura headless permite a los desarrolladores concentrarse en crear experiencias de usuario únicas mientras Strapi se encarga de la compleja gestión de contenido y la exposición de APIs.

La separación clara entre la gestión de contenido (backend) y la presentación (frontend) hace que Strapi sea ideal para proyectos donde el contenido debe ser consumido por múltiples plataformas (web, móvil, aplicaciones de terceros, etc.) desde una única fuente de verdad.