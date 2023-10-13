type DistanceFn<T> = (p1: T, p2: T) => number;
type CentroidFn<T> = (points: T[]) => T;
type InitFn<T> = (points: T[], k: number) => T[];

type Options<T> = {
  distanceFn: DistanceFn<T>;
  centroidFn: CentroidFn<T>;
  initFn?: InitFn<T>;
};

type Cluster<T> = {
  center: T,
  points: T[]
};

function initRandom<T>(points: T[], k: number) {
  function random(start: number, end: number) {
    return Math.round(Math.random() * (end - start)) + start;
  }

  const indicies = new Set<number>();
  while (indicies.size < k) {
    indicies.add(random(0, points.length));
  }

  return [...indicies].map((i) => points[i]);
}

export function closestPointIndex<T>(points: T[], point: T, distanceFn: DistanceFn<T>) {
  let result = 0;
  let pDistance = distanceFn(points[0], point);
  for (let i = 1; i < points.length; i += 1) {
    const dst = distanceFn(points[i], point);
    if (dst < pDistance) {
      pDistance = dst;
      result = i;
    }
  }

  return result;
};

export function kMeans<T>(
  points: T[],
  k: number,
  { distanceFn, centroidFn, initFn = initRandom }: Options<T>
) {
  const clusters: Array<Cluster<T>> = [];
  const initialPoints = initFn(points, k);

  initialPoints.forEach((point) => {
    clusters.push({
      center: point,
      points: [],
    });
  });

  const centerPoint = (points: T[]) => {
    const centerIndex = closestPointIndex(
      points,
      centroidFn(points),
      distanceFn
    );
    return points[centerIndex];
  };

  const assingPoints = () => {
    const centers = clusters.map((c) => c.center);
    points.forEach((point) => {
      const clusterIndex = closestPointIndex(centers, point, distanceFn);
      clusters[clusterIndex].points.push(point);
    });
  };

  const updateCenters = () => {
    clusters.forEach((cluster) => {
      cluster.center = centerPoint(cluster.points);
      cluster.points = [];
    });
  };

  assingPoints();

  for (let i = 0; i < 25; i += 1) {
    updateCenters();
    assingPoints();
  }

  return clusters.map((c) => c.points);
}
