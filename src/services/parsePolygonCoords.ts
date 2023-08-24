import { Coordinates } from 'src/models/types';

/**
 * 폴리곤의 4 코너 좌표를 "lat1,lng1|lat2,lng2|..." 형식으로 받는다는 가정하에 대충 파싱만 하는 부분이에요.
 */
export const parsePolygonCoords = (polygonArg: string): Coordinates[] => {
  return polygonArg.split("|").map((coord: string) => {
    const parts = coord.split(",").map(Number);

    if (parts.length !== 2 || parts.includes(NaN)) {
      throw new Error(`Invalid coordinate: ${coord}`);
    }
    return parts as [number, number];
  });
};
