export type Coordinates = [number, number];

export type H3IndexData = {
  index: string;
  count: number;
  label?: number;
  ids: number[];
};

export interface ArticlePoint {
  id: number;
  coords: Coordinates;
}

export interface H3ArticlePoint extends ArticlePoint {
  h3Index: { [key: number]: string };
}

export interface Cluster {
  type: string;
  h3Index: string;
  centerCoords: Coordinates;
  label: number;
  count: number;
  articles: ArticlePoint[];
}
