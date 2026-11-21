export type MarketPageId =
  | "everyday"
  | "coding"
  | "media"
  | "study";

export type MarketItem = {
  id: string;
  name: string;
  description: string;
  /** Short glyph used as thumbnail art */
  emoji: string;
  accent: string;
  /** Local mini-app written into Files, or open an official download page */
  kind: "miniapp" | "link";
  /** Relative path under apps/ when kind=miniapp */
  path?: string;
  /** Official download / project URL when kind=link */
  url?: string;
};

export type MarketPage = {
  id: MarketPageId;
  title: string;
  blurb: string;
  items: MarketItem[];
};
