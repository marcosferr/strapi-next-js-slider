# Guía de Integración: Strapi v5 + Next.js (Slides & Real-time Updates)

Esta documentación detalla cómo integrar un backend Strapi v5.31.3 con un frontend Next.js 16 para gestionar un carrusel de imágenes y un sistema de notificaciones en tiempo real utilizando endpoints públicos.

## 1. Requisitos Previos

- **Strapi Version**: v5.31.3
- **Next.js Version**: 16.x
- **Node.js**: v18+

## 2. Configuración de Variables de Entorno

Para conectar el frontend con el backend, definimos la URL de la API.

**Archivo:** `frontend/.env.local`

```bash
# URL del backend de Strapi
STRAPI_URL=http://localhost:1337
```

> **Nota:** Al realizar el fetching desde *Server Components* (como en `page.tsx`), podemos usar `STRAPI_URL`. Si necesitaras acceder desde el cliente (browser), deberías usar `NEXT_PUBLIC_STRAPI_URL`.

## 3. Configuración del Backend (Strapi)

### 3.1 Content Types

Debes crear dos "Collection Types" en Strapi.

#### A. Slide (Carrusel)
*Display Name:* `Slide`  
*API ID:* `slide`

| Campo | Tipo | Configuración | Descripción |
|-------|------|---------------|-------------|
| `mainText` | Text (Short) | Required | Título principal del slide |
| `secondaryText` | Text (Short) | Optional | Subtítulo o texto secundario |
| `description` | Text (Long) | Optional | Descripción detallada |
| `imageUrl` | Text (Short) | Required | URL absoluta de la imagen |
| `ctaLabel` | Text (Short) | Optional | Texto del botón (ej: "Ver más") |
| `ctaUrl` | Text (Short) | Optional | URL de destino del botón |
| `order` | Number (Integer) | Optional | Para ordenar los slides (1, 2, 3...) |

#### B. Real-time Update (Noticias)
*Display Name:* `Actualización en tiempo real`  
*API ID:* `real-time-update`

| Campo | Tipo | Configuración | Descripción |
|-------|------|---------------|-------------|
| `content` | Text (Long) | Required | El texto de la noticia/alerta |
| `isActive` | Boolean | Default: true | Si debe mostrarse en la cinta |

### 3.2 Permisos Públicos (Crucial)

Para que el frontend pueda leer los datos sin autenticación (token), debes exponer los endpoints:

1. Ve a **Settings** > **Users & Permissions Plugin** > **Roles**.
2. Selecciona el rol **Public**.
3. En la sección **Permissions**:
   - Busca **Slide**: Marca `find` y `findOne`.
   - Busca **Real-time-update**: Marca `find` y `findOne`.
4. Guarda los cambios.

* Esto ya estaria configurado en el servidor de Tape
## 4. Integración en Frontend (Next.js)

### 4.1 Definición de Tipos

**Archivo:** `src/types/strapi.ts`

```typescript
export type Slide = {
  id: number;
  mainText: string;
  secondaryText?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  order?: number;
};

export type RealTimeUpdate = {
  id: number;
  content: string;
  isActive: boolean;
};
```

### 4.2 Fetching de Datos (Server Component)

En Next.js (App Router), realizamos las peticiones directamente en el servidor. Usamos `cache: 'no-store'` para asegurar que las actualizaciones en tiempo real se reflejen instantáneamente al recargar.

**Archivo:** `src/app/page.tsx`

```tsx
import { Slide, RealTimeUpdate } from "@/types/strapi";

// Helper para obtener la URL base
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getSlides(): Promise<Slide[]> {
  try {
    // Ordenamos por el campo 'order' ascendente
    const res = await fetch(`${STRAPI_URL}/api/slides?sort=order:asc`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) throw new Error("Failed to fetch slides");
    
    const { data } = await res.json();
    
    // Mapeo de respuesta Strapi v5 (Flat) a nuestro tipo
    return data.map((item: any) => ({
      id: item.id,
      mainText: item.mainText,
      secondaryText: item.secondaryText,
      description: item.description,
      imageUrl: item.imageUrl,
      ctaLabel: item.ctaLabel,
      ctaUrl: item.ctaUrl,
      order: item.order,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getUpdates(): Promise<RealTimeUpdate[]> {
  try {
    // Filtramos solo los activos
    const res = await fetch(`${STRAPI_URL}/api/real-time-updates?filters[isActive][$eq]=true`, { 
      cache: "no-store" 
    });

    if (!res.ok) throw new Error("Failed to fetch updates");

    const { data } = await res.json();

    return data.map((item: any) => ({
      id: item.id,
      content: item.content,
      isActive: item.isActive,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Page() {
  // Ejecutamos las peticiones en paralelo para mayor velocidad
  const [slides, updates] = await Promise.all([getSlides(), getUpdates()]);

  return (
    <main>
      {/* Pasamos los datos al componente Cliente */}
      <Carousel slides={slides} realTimeUpdates={updates} />
    </main>
  );
}
```

### 4.3 Estructura de Respuesta API (Referencia)

Strapi v5 devuelve los datos en una estructura plana (a diferencia de v4 que usaba `attributes`).

**GET** `/api/slides`
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "...",
      "mainText": "Título Principal",
      "secondaryText": "Subtítulo",
      "imageUrl": "https://...",
      "createdAt": "..."
    }
  ],
  "meta": {
    "pagination": { ... }
  }
}
```
