/* k-means implementation in 2D */

/**
 * Calculates the mean for x and y of the given data points.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - given data points to calculate measure on, whereas the array contains the data points; centroid_index is not needed here, but is part of the default data structure
 * @returns {{x, y}} - the measure (here: mean)
 */
function mean(datapoints) {
  const avg = (arr) => arr.reduce((prev, curr) => prev + curr, 0) / arr.length;

  const xCoords = datapoints.map(obj => obj.x);
  const yCoords = datapoints.map(obj => obj.y);
  
  return { x: avg(xCoords), y: avg(yCoords) }
}
/**
 * Calculates the median for x and y of the given data points.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - given data points to calculate measure on, whereas the array contains the data points; centroid_index is not needed here, but is part of the default data structure
 * @returns {{x, y}} - the measure (here: median)
 */
function median(datapoints) {
  const median_helper = (arr) => {
    const sorted = arr.sort()
    const len = arr.length;
    const middleIndex = Math.floor(len / 2);

    if (len % 2 === 0) {
      return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
    } else {
      return sorted[middleIndex];
    }
  }

  const xCoords = datapoints.map(obj => obj.x);
  const yCoords = datapoints.map(obj => obj.y);
  
  return { x: median_helper(xCoords), y: median_helper(yCoords) };
}

/**
 * Calculates the euclidian distance between two points in space.
 *
 * @param {{ x, y, centroid_index }} point1 - first point in space
 * @param {{ x, y, centroid_index }} point2 - second point in space
 * @returns {Number} - the distance of point1 and point2
 */
function euclid(point1, point2) {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;

  // Calculate the square of the differences
  const squaredDistance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);

  // Calculate the square root to get the Euclidean distance
  const distance = Math.sqrt(squaredDistance);

  return distance;
}

/**
 * Calculates the manhattan distance between two points in space.
 *
 * @param {{ x, y, centroid_index }} point1 - first point in space
 * @param {{ x, y, centroid_index }} point2 - second point in space
 * @returns {Number} - the distance of point1 and point2
 */
function manhattan(point1, point2) {
  const deltaX = Math.abs(point2.x - point1.x);
  const deltaY = Math.abs(point2.y - point1.y);

  // Calculate the sum of the absolute differences
  const distance = deltaX + deltaY;

  return distance;
}

/**
 * Assigns each data point according to the given distance function to the nearest centroid.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 * @param {Function} distance_function - calculates the distance between positions
 * @returns {[{ x, y, centroid_index }, ...]} - data points with new centroid-assignments
 */
function assign_datapoints_to_centroids(
  datapoints,
  centroids,
  distance_function
) {
  return datapoints.map(datapoint => {
    // Initialize variables for tracking the nearest centroid and its distance
    let nearestCentroid = null;
    let nearestDistance = Infinity;

    // Iterate over each centroid
    centroids.forEach(centroid => {
      // Calculate the distance between the data point and the current centroid
      const distance = distance_function(datapoint, centroid);

      // Check if this centroid is closer than the previous nearest centroid
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCentroid = centroid;
      }
    });

    // Assign the centroid index to the data point
    return { ...datapoint, centroid_index: centroids.indexOf(nearestCentroid) };
  });
}

/**
 * Calculates for each centroid it's new position according to the given measure.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 * @param {Function} measure_function - measure of data set (e.g. mean-function, median-function, ...)
 * @returns {{[{ x, y }, ... ], Boolean}} - centroids with new positions, and true of at least one centroid position changed
 */
function calculate_new_centroids(datapoints, centroids, measure_function) {
  let centroids_changed = false;

  const newCentroids = centroids.map( centroid => {
    const centroidPoints = datapoints.filter(point => point.centroid_index === centroids.indexOf(centroid));
    if (centroidPoints.length === 0) {
      return centroid;
    }
    const newCoord = measure_function(centroidPoints);

    if (newCoord.x !== centroid.x && newCoord.y !== centroid.y) {
      centroids_changed = true;
      return newCoord;
    }
    return centroid;
  });
  
  return { newCentroids, centroids_changed }
}

/**
 * Generates random centroids according to the data point boundaries and the specified k.
 *
 * @param {[{ x, y }, ...]} datapoints - all available data points
 * @param {Number} k - number of centroids to be generated as a Number
 * @returns {[{ x, y }, ...]} - generated centroids
 */
function get_random_centroids(datapoints, k) {
  let centroids = [];
  
  // Get the boundaries of x and y coordinates
  const xValues = datapoints.map(point => point.x);
  const yValues = datapoints.map(point => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // Generate k random centroids within the boundaries
  for (let i = 0; i < k; i++) {
    const centroid = {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY
    };
    centroids.push(centroid);
  }
  if (k===2) return [{"x":-0.75, "y": 0.4}, {"x":0.9, "y": -0.4}];
  return centroids;
}

function kmeans(datapoints, k, measure_func, distance_func) {
  let centroids = get_random_centroids(datapoints, k);
  let converged = false;

  let counter = 0;
  while (!converged && counter < 10000) {
    datapoints = assign_datapoints_to_centroids(datapoints, centroids, distance_func);
    const result = calculate_new_centroids(datapoints, centroids, measure_func);
    centroids = result.newCentroids;
    converged = !result.centroids_changed;
    counter++;
  }

  return {datapoints, centroids};
}
