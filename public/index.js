// this is working because of the import in the html file
// https://socket.io/docs/v4/client-installation/#standalone-build 
const socket = io()
var chartType = "unused"

socket.on("connect", () => {
  console.log("Connected to the webserver.")
})
socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.")
})
socket.on("boardgames_data", (obj) => {
  console.log("Received data:", obj)

  const preprocessedData = preprocessData(obj);

  if (chartType === "scatterplot") {
    draw_scatterplot_and_regressionline(preprocessedData);
  } else if (chartType === "timeline") {
    draw_year_minage_timeline(preprocessedData);
  } else {
    console.error("Unknown chart type received: ", chartType);
  }

});

function clearChart() {
  d3.select("#chart svg").remove();
}

/////////////////////////////////////////// preprocess the data ////////////////////////////////////////////

function preprocessData(data) {
  // Check for missing values
  const missingValues = data.some((d) =>
    Object.values(d).some((value) => value === null || value === undefined)
  );
  if (missingValues) throw new Error("Data contains missing values");

  // Select variables to include in scatterplot matrix
  const cols = [
    "year",
    "minplayers",
    "maxplayers",
    "minplaytime",
    "maxplaytime",
    "minage",
    "rating",
  ];

  // Create a new array of objects with selected variables
  const df_scatter = data.map((d) =>
    cols.reduce(
      (acc, col) => ({
        ...acc,
        [col]: d[col],
      }),
      {}
    )
  );

  // Combine minplaytime and maxplaytime into a single average playtime variable
  const avg_playtime = df_scatter.map((d) =>
    (d.minplaytime + d.maxplaytime) / 2
  );
  const mean_avg_playtime = avg_playtime.reduce((acc, d) => acc + d, 0) / avg_playtime.length;
  df_scatter.forEach((d) => {
    d.avg_playtime = (d.minplaytime + d.maxplaytime) / 2 > 300 ? mean_avg_playtime : (d.minplaytime + d.maxplaytime) / 2;
  });

  // Extract the 'rating' column into a separate Series
  const pd_avg_rating = df_scatter.map((d) => d.rating.rating);

  // Add the pd_avg_rating array as a new property to the df_scatter array
  df_scatter.forEach((d, i) => {
    d.avg_rating = pd_avg_rating[i];
  });

  // Drop the original minplaytime and maxplaytime properties
  df_scatter.forEach((d) => {
    delete d.minplaytime;
    delete d.maxplaytime;
    delete d.rating;
    delete d.minplayers;
    delete d.maxplayers;
  });

  // Return the preprocessed data as an array of objects
  return df_scatter;
};

////////////////////////////////////////////////// Task_1 //////////////////////////////////////////////////

function Task_1() {
  chartType = "scatterplot"
  socket.emit("get_boardgames_data")
}

function draw_scatterplot_and_regressionline(data) {
  clearChart();

  // Set the dimensions and margins for the chart
  var margin = { top: 50, right: 30, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Create an SVG container and group (g) element, and apply a transformation for the margins
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add a title to the chart
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "21px")
    .attr("font-weight", "bold")
    .text("Correlation: Rating & Playtime");

  // Define the x-axis scale based on average playtime
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.avg_playtime))
    .range([0, width]);

  // Define the y-axis scale based on average rating
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.avg_rating))
    .range([height, 0]);

  // Create and position circle elements for each data point
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.avg_playtime))
    .attr('cy', d => yScale(d.avg_rating))
    .attr('r', 4)
    .attr('fill', 'steelblue');

  // Create and position the x-axis
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Add the x-axis and label to the chart
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.bottom + 10)
    .attr('fill', 'black')
    .attr("font-size", "16px")
    .text('Average Playtime in minutes');

  // Add the y-axis and label to the chart
  svg.append('g')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left / 1.5)
    .attr('x', -height / 2)
    .attr('fill', 'black')
    .attr("font-size", "16px")
    .text('Rating');

  // Calculate the coefficients for the regression line
  const regressionResult = ss.linearRegression(data.map(d => [d.avg_playtime, d.avg_rating]));

  // Create a function to calculate the y-coordinate of the regression line for any given x-coordinate
  const regressionLine = x => (regressionResult.m * x) + regressionResult.b;

  // Create an array of x-coordinates for the regression line
  const xCoords = d3.range(
    d3.min(data, d => d.avg_playtime),
    d3.max(data, d => d.avg_playtime),
    (d3.max(data, d => d.avg_playtime) - d3.min(data, d => d.avg_playtime)) / 200
  );

  // Calculate the corresponding y-coordinates
  const lineData = xCoords.map(x => ({ x: x, y: regressionLine(x) }));

  // Define a line generator
  const lineGenerator = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  // Draw the regression line on the scatterplot
  svg.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5,5")
    .attr("d", lineGenerator);

}
////////////////////////////////////////////////// Task_2 //////////////////////////////////////////////////

function Task_2() {
  chartType = "timeline"
  socket.emit("get_boardgames_data")
}

function draw_year_minage_timeline(data) {
  clearChart();

  // Set the dimensions and margins for the chart
  var margin = { top: 50, right: 30, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Create an SVG container and group (g) element, and apply a transformation for the margins
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Define the x-axis scale based on the year
  const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
    .range([0, width]);

  // Define the y-axis scale based on the minage
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.minage)])
    .range([height, 0]);

  // Create and position the x-axis
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));

  // Add the x-axis and label to the chart
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .append('text')
    .attr('y', 30)
    .attr('x', width / 2)
    .attr('fill', 'black')
    .attr("font-size", "16px")
    .text('Year');

  // Create and position the y-axis
  const yAxis = d3.axisLeft(yScale);

  // Add the y-axis and label to the chart
  svg.append('g')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left / 1.5)
    .attr('x', -height / 2)
    .attr('fill', 'black')
    .attr("font-size", "16px")
    .text('Minimum Age');

  // Create a line generator function
  const lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.minage));

  // Sort the data by year to ensure the line connects points in the correct order
  data.sort((a, b) => a.year - b.year);

  // Create and position the line path
  svg.append('path')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2);
}
