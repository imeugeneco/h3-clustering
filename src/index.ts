import h3 from "h3-js";

export type Coordinates = [number, number];

type H3IndexData = {
  index: string;
  count: number;
  label?: number;
  ids: number[];
};

interface ArticlePoint {
  id: number;
  coords: Coordinates;
}

interface Cluster {
  type: string;
  h3Index: string;
  centerCoords: Coordinates;
  label: number;
  count: number;
  articles: ArticlePoint[];
}

export const clusterArticlePoints = (
  data: ArticlePoint[],
  polygonCoords: Coordinates[],
  resolution: number
): Cluster[] => {
  // convert polygon coordinates to H3 indexes
  const hexagons = h3.polygonToCells(polygonCoords, resolution);

  const h3Indexes: Map<string, H3IndexData> = new Map();

  for (const point of data) {
    const cell = h3.latLngToCell(point.coords[0], point.coords[1], resolution);
    // skip points outside of given polygon
    if (!hexagons.includes(cell)) continue;

    let cellData = h3Indexes.get(cell) || { index: cell, count: 0, ids: [] };
    cellData.count += 1;
    cellData.ids.push(point.id);
    h3Indexes.set(cell, cellData);
  }

  const clusters: Cluster[] = [];

  console.log(h3Indexes);

  // cluster neighboring cells within k-ring proximity
  // k to be determined later with zoom level tests
  for (const idx of h3Indexes.keys()) {
    const clusterCells: string[] = [];
    const label = clusters.length;
    const candidateCells = new Set([idx]);
    console.log(`${idx} ==> ${candidateCells}`);

    while (candidateCells.size) {
      const cell = Array.from(candidateCells)[0];
      candidateCells.delete(cell);

      const cellData = h3Indexes.get(cell);
      if (!cellData || cellData.label !== undefined) continue;

      cellData.label = label;
      clusterCells.push(cell);

      const neighborCells = h3.gridDisk(cell, 2);
      for (const neighborCell of neighborCells) {
        const neighborData = h3Indexes.get(neighborCell);
        if (neighborData && neighborData.label === undefined) {
          candidateCells.add(neighborCell);
        }
      }
    }

    const totalCount = clusterCells.reduce(
      (sum, cell) => sum + (h3Indexes.get(cell)?.count || 0),
      0
    );

    if (totalCount > 0) {
      const articles: ArticlePoint[] = clusterCells.flatMap((cell) =>
        (h3Indexes.get(cell)?.ids || []).map((id) => ({
          id,
          coords: h3.cellToLatLng(cell),
        }))
      );

      clusters.push({
        type: "Cluster",
        h3Index: idx,
        centerCoords: h3.cellToLatLng(idx),
        label,
        count: totalCount,
        articles,
      });
    }
  }

  return clusters;
};
