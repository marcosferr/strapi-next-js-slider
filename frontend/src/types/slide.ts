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
