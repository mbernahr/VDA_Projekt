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
    const middleIndex = Math.floor(length / 2);

    if (len % 2 === 0) {
      return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
    } else {
      return sorted[middleIndex];
    }
  }

  const xCoords = datapoints.map(obj => obj.x);
  const yCoords = datapoints.map(obj => obj.y);
  
  return { x: median_helper(xCoords), y: median_helper(yCoords) }
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
  // TODO
  return datapoints
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
  let centroids_changed = false
  // TODO
  return { centroids, centroids_changed }
}

/**
 * Generates random centroids according to the data point boundaries and the specified k.
 *
 * @param {[{ x, y }, ...]} datapoints - all available data points
 * @param {Number} k - number of centroids to be generated as a Number
 * @returns {[{ x, y }, ...]} - generated centroids
 */
function get_random_centroids(datapoints, k) {
  let centroids = []
  // TODO
  return centroids
}
