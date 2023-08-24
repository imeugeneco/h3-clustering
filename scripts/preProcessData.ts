/**
 * 기존 article point에 h3 인덱스를 추가해서 csv로 저장할 용도예요.
 * 데이터베이스 거치지 않고 실험하기 위해 작성한 스크립트고,
 * 실제로는 해상도별 h3 인덱스 칼럼을 추가하면 될 것 같아요.
 */

import csvParser from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import fs from 'fs';
import h3 from 'h3-js';
import { H3ArticlePoint } from 'src/models/types';

const args = process.argv.slice(2);

const inputPath = args
  .find((d) => d.startsWith("input="))
  ?.replace("input=", "");
const outputPath = args
  .find((d) => d.startsWith("output="))
  ?.replace("output=", "");

if (!inputPath) throw new Error("Invalid/Missing Input Path");
if (!outputPath) throw new Error("Invalid/Missing Output Path");

const resolutions = [6, 7, 9];

const processSale = (point: H3ArticlePoint) => {
  const h3Index: { [key: number]: string } = {};
  for (const resolution of resolutions) {
    h3Index[resolution] = h3.latLngToCell(
      point.coords[0],
      point.coords[1],
      resolution
    );
  }
  return { ...point, h3Index };
};

const t0 = Date.now();
const articlePoints: H3ArticlePoint[] = [];

fs.createReadStream(inputPath)
  .pipe(csvParser({ headers: false }))
  .on("data", (row) => {
    const articlePoint: H3ArticlePoint = {
      id: +row[0],
      coords: [+row[2], +row[3]], // lat, lon
      h3Index: {},
    };
    articlePoints.push(processSale(articlePoint));
  })
  .on("end", () => {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: "id", title: "ID" },
        { id: "lat", title: "Lat" },
        { id: "lon", title: "Lon" },
        ...resolutions.map((resolution) => ({
          id: `h3Index_${resolution}`,
          title: `H3Index_${resolution}`,
        })),
      ],
    });

    const records = articlePoints.map((point) => ({
      id: point.id,
      lat: point.coords[0],
      lon: point.coords[1],
      ...Object.fromEntries(
        Object.entries(point.h3Index).map(([resolution, index]) => [
          `h3Index_${resolution}`,
          index,
        ])
      ),
    }));

    csvWriter.writeRecords(records).then(() => {
      console.log("Done.");
    });
  });

console.log(`${(Date.now() - t0) / 1000} seconds`);
