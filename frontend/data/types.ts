export interface GameCode {
  id: string;
  code: string;
  reward: string;
  isNew: boolean;
  createdAt: string;
}

export interface PolymorphicUpload {
  relationTo: string;
  value: {
    url: string;
  };
}

export interface FeaturedItem {
  name: string;
  icon: string;
}

export interface BannerData {
  featuredChars?: FeaturedItem[];
  featuredWeapons?: FeaturedItem[];
}

export interface GameEvent {
  id: string;
  name: string;
  type: "banner" | "event";
  start: string;
  end: string;
  image?: string | PolymorphicUpload | null;
  label?: string | null;
  tags?: string | null;
  bannerData?: BannerData;
}
