import Carousel from "@/components/Carousel";
import { Slide } from "@/types/slide";
import { RealTimeUpdate } from "@/types/real-time-update";

type StrapiSlide = {
  id: number;
  mainText?: string;
  secondaryText?: string | null;
  description?: string | null;
  imageUrl?: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  order?: number | null;
  attributes?: {
    mainText?: string;
    secondaryText?: string | null;
    description?: string | null;
    imageUrl?: string;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    order?: number | null;
  };
};

type StrapiRealTimeUpdate = {
  id: number;
  content?: string;
  isActive?: boolean;
  attributes?: {
    content?: string;
    isActive?: boolean;
  };
};

const fetchSlides = async (): Promise<Slide[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337";
  const url = `${baseUrl}/api/slides?sort=order:asc`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error(`Error fetching slides: ${res.status}`);
    return [];
  }

  const payload = (await res.json()) as { data?: StrapiSlide[] };

  return (payload.data || [])
    .map((item) => {
      const attrs = item.attributes ?? item;
      if (!attrs?.mainText || !attrs?.imageUrl) return null;
      return {
        id: item.id,
        mainText: attrs.mainText,
        secondaryText: attrs.secondaryText ?? undefined,
        description: attrs.description ?? undefined,
        imageUrl: attrs.imageUrl,
        ctaLabel: attrs.ctaLabel ?? undefined,
        ctaUrl: attrs.ctaUrl ?? undefined,
        order: attrs.order ?? undefined,
      } as Slide;
    })
    .filter(Boolean) as Slide[];
};

const fetchRealTimeUpdates = async (): Promise<RealTimeUpdate[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337";
  const url = `${baseUrl}/api/real-time-updates?filters[isActive][$eq]=true`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error(`Error fetching real-time updates: ${res.status}`);
    return [];
  }

  const payload = (await res.json()) as { data?: StrapiRealTimeUpdate[] };

  return (payload.data || [])
    .map((item) => {
      const attrs = item.attributes ?? item;
      if (!attrs?.content) return null;
      return {
        id: item.id,
        content: attrs.content,
        isActive: attrs.isActive ?? true,
      } as RealTimeUpdate;
    })
    .filter(Boolean) as RealTimeUpdate[];
};

export default async function Home() {
  const [slides, realTimeUpdates] = await Promise.all([
    fetchSlides(),
    fetchRealTimeUpdates(),
  ]);

  return (
    <main className="page" style={{ padding: 0, maxWidth: '100%' }}>
      <Carousel slides={slides} realTimeUpdates={realTimeUpdates} />
    </main>
  );
}
