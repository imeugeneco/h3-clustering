import h3 from 'h3-js';
import { ArticlePoint, Cluster, Coordinates, H3IndexData } from 'src/models/types';

export const filterArticlePoints = (
  data: ArticlePoint[],
  polygonCoords: Coordinates[],
  resolution: number
): ArticlePoint[] => {
  const hexagons = new Set(h3.polygonToCells(polygonCoords, resolution));
  const filteredData: ArticlePoint[] = [];

  for (const point of data) {
    const cell = h3.latLngToCell(point.coords[0], point.coords[1], resolution);
    if (hexagons.has(cell)) {
      filteredData.push(point);
    }
  }

  return filteredData;
};

export const clusterArticlePoints = (
  data: ArticlePoint[],
  resolution: number
): Cluster[] => {
  const h3Indexes: Map<string, H3IndexData> = new Map();

  for (const point of data) {
    const cell = h3.latLngToCell(point.coords[0], point.coords[1], resolution);

    let cellData = h3Indexes.get(cell) || { index: cell, count: 0, ids: [] };
    cellData.count += 1;
    cellData.ids.push(point.id);

    h3Indexes.set(cell, cellData);
  }

  const clusters: Cluster[] = [];

  // cluster neighboring cells within k-ring proximity
  // k to be determined later with zoom level tests
  for (const idx of h3Indexes.keys()) {
    const clusterCells: string[] = [];
    const label = clusters.length;
    const candidateCells = new Set([idx]);

    while (candidateCells.size) {
      const cell = candidateCells.values().next().value;
      candidateCells.delete(cell);

      const cellData = h3Indexes.get(cell);
      if (!cellData || cellData.label !== undefined) continue;

      cellData.label = label;
      clusterCells.push(cell);

      const neighborCells = h3.gridDisk(cell, 1);
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
