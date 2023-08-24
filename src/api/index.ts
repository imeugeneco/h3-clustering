import bodyParser from 'body-parser';
import csvParser from 'csv-parser';
import express from 'express';
import * as fs from 'fs';

import { H3ArticlePoint } from '../models/types';
import { clusterArticlePoints, filterArticlePoints, parsePolygonCoords } from '../services';

const app = express();
const port = 3333;

app.use(bodyParser.json());

const data: H3ArticlePoint[] = [];
fs.createReadStream("./outputs/articles-processed.json")
  .pipe(csvParser())
  .on("data", (row) => {
    data.push({
      id: +row.ID,
      coords: [+row.Lat, +row.Lon],
      h3Index: {
        6: row.H3Index_6,
        7: row.H3Index_7,
        9: row.H3Index_9,
      },
    });
  })
  .on("end", () => {});

app.post("/filter", (req, res) => {
  if (
    typeof req.body.polygonArg !== "string" ||
    typeof req.body.resolution !== "number"
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const resolution = req.body.resolution;
  const polygonCoords = parsePolygonCoords(req.body.polygonArg);

  const filteredData = filterArticlePoints(data, polygonCoords, resolution);

  res.json({ count: filteredData.length, articles: filteredData });
});

app.post("/filter/cluster", (req, res) => {
  if (
    typeof req.body.polygonArg !== "string" ||
    typeof req.body.resolution !== "number"
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const resolution = req.body.resolution;
  const polygonCoords = parsePolygonCoords(req.body.polygonArg);

  const filteredData = filterArticlePoints(data, polygonCoords, resolution);
  const clusters = clusterArticlePoints(filteredData, resolution);

  res.json({ count: clusters.length, clusters });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
