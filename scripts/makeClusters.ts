/**
 * 기존 데이터로 주어진 폴리곤 내에서 클러스터링 테스트하는 용도예요.
 * clusterArticlePoints의 매개변수 등이 수정되어 오류가 날텐데,
 * 더이상 필요하지 않은 스크립트라서 따로 대응은 안해두었어요.
 */

import fs from 'fs';
import path from 'path';
import { Coordinates } from 'src/models/types';
import { clusterArticlePoints } from 'src/services/clusterArticlePoints';

const defaultConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf-8")
);

const args = process.argv.slice(2);

const inputPath = args
  .find((d) => d.startsWith("input="))
  ?.replace("input=", "");
const outputPath = args
  .find((d) => d.startsWith("output="))
  ?.replace("output=", "");

if (!inputPath) throw new Error("Invalid/Missing Input Path");
if (!outputPath) throw new Error("Invalid/Missing Output Path");

const resolution: number = +(
  args.find((d) => d.startsWith("resolution="))?.replace("resolution=", "") ??
  defaultConfig.resolution
);

const polygonArg: string =
  args.find((d) => d.startsWith("polygon="))?.replace("polygon=", "") ??
  defaultConfig.polygonArg;

// assumes polygon coordinates are given as "lat1,lng1|lat2,lng2|..."
const polygonCoords = polygonArg.split("|").map((coord) => {
  const [lat, lng] = coord.split(",").map(Number);
  return [lat, lng] as Coordinates;
});

const rawData = fs.readFileSync(inputPath, "utf-8").split("\n");
const articlePoints = rawData.map((str) => {
  const [id, , lat, lng] = str.split(",").map((e) => parseFloat(e));
  return { id, coords: [lat, lng] as Coordinates };
});

const t0 = Date.now();
const clusters = clusterArticlePoints(articlePoints, polygonCoords, resolution);

console.log(`${(Date.now() - t0) / 1000} seconds`);

const collection = {
  type: "ClusterCollection",
  resolution,
  total: clusters.reduce((sum, cluster) => sum + cluster.count, 0),
  clusters,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf-8");
