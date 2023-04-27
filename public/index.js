function clearChart() {
	d3.select("#chart svg").remove();
  }

  function drawLine(ctx, x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  const data = [{"year":2017,"minage":14,"avg_playtime":90.0,"avg_rating":8.67527},{"year":2018,"minage":14,"avg_playtime":90.0,"avg_rating":8.65313},
  {"year":2015,"minage":13,"avg_playtime":60.0,"avg_rating":8.56688},{"year":2021,"minage":14,"avg_playtime":120.0,"avg_rating":8.56684},
  {"year":2017,"minage":14,"avg_playtime":106.375,"avg_rating":8.6449},{"year":2016,"minage":12,"avg_playtime":120.0,"avg_rating":8.39103},
  {"year":2020,"minage":14,"avg_playtime":75.0,"avg_rating":8.55175},{"year":2016,"minage":14,"avg_playtime":210.0,"avg_rating":8.41817},
  {"year":2011,"minage":13,"avg_playtime":165.0,"avg_rating":8.52576},{"year":2017,"minage":13,"avg_playtime":105.0,"avg_rating":8.36924},
  {"year":2017,"minage":12,"avg_playtime":105.0,"avg_rating":8.42974},{"year":2020,"minage":14,"avg_playtime":90.0,"avg_rating":8.36497},
  {"year":2015,"minage":14,"avg_playtime":120.0,"avg_rating":8.3355},{"year":2005,"minage":13,"avg_playtime":150.0,"avg_rating":8.26264},
  {"year":2016,"minage":12,"avg_playtime":112.5,"avg_rating":8.25687},{"year":2016,"minage":14,"avg_playtime":102.5,"avg_rating":8.1865},
  {"year":2011,"minage":12,"avg_playtime":60.0,"avg_rating":8.12806},{"year":2018,"minage":12,"avg_playtime":135.0,"avg_rating":8.33096},
  {"year":2015,"minage":10,"avg_playtime":30.0,"avg_rating":8.0984},{"year":2007,"minage":14,"avg_playtime":90.0,"avg_rating":8.18934},
  {"year":2013,"minage":13,"avg_playtime":100.0,"avg_rating":8.11031},{"year":2016,"minage":12,"avg_playtime":75.0,"avg_rating":8.18794},
  {"year":2020,"minage":14,"avg_playtime":130.0,"avg_rating":8.55169},{"year":2012,"minage":12,"avg_playtime":105.0,"avg_rating":8.09724},
  {"year":2019,"minage":10,"avg_playtime":55.0,"avg_rating":8.08126},{"year":2019,"minage":13,"avg_playtime":105.0,"avg_rating":8.61029},
  {"year":2016,"minage":14,"avg_playtime":90.0,"avg_rating":8.14743},{"year":2018,"minage":10,"avg_playtime":75.0,"avg_rating":8.09206},
  {"year":2020,"minage":12,"avg_playtime":75.0,"avg_rating":8.09201},{"year":2014,"minage":12,"avg_playtime":90.0,"avg_rating":8.06819},
  {"year":2018,"minage":13,"avg_playtime":60.0,"avg_rating":8.07132},{"year":2015,"minage":13,"avg_playtime":67.5,"avg_rating":8.02556},
  {"year":2011,"minage":14,"avg_playtime":150.0,"avg_rating":8.09071},{"year":2019,"minage":14,"avg_playtime":90.0,"avg_rating":8.20379},
  {"year":2015,"minage":14,"avg_playtime":180.0,"avg_rating":8.09416},{"year":2019,"minage":14,"avg_playtime":67.5,"avg_rating":8.16512},
  {"year":2017,"minage":12,"avg_playtime":90.0,"avg_rating":8.38036},{"year":2021,"minage":10,"avg_playtime":20.0,"avg_rating":8.29454},
  {"year":2002,"minage":12,"avg_playtime":120.0,"avg_rating":7.94204},{"year":2013,"minage":12,"avg_playtime":120.0,"avg_rating":7.97952}];

  console.log(data)


  function Task_1(data) {
    clearChart(); // Remove any previous chart elements
  
    console.log(data); // Log data to the console for debugging purposes
  
    // Set the dimensions and margins for the chart
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  
    // Create an SVG container and group (g) element, and apply a transformation for the margins
    var svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
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
      .attr('y', margin.bottom )
      .attr('fill', 'black')
      .text('Average Playtime');
  
    // Add the y-axis and label to the chart
    svg.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left / 1.5)
      .attr('x', -height / 2)
      .attr('fill', 'black')
      .text('Average Rating');

  // Calculate the coefficients for the regression line
  const regressionResult = ss.linearRegression(data.map(d => [d.avg_playtime, d.avg_rating]));

  // Create a function to calculate the y-coordinate of the regression line for any given x-coordinate
  const regressionLine = x => (regressionResult.m * x) + regressionResult.b;

  // Create an array of x-coordinates for the regression line
  const xCoords = d3.range(
    d3.min(data, d => d.avg_playtime),
    d3.max(data, d => d.avg_playtime),
    (d3.max(data, d => d.avg_playtime) - d3.min(data, d => d.avg_playtime)) / 1000
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
// this is working because of the import in the html file
// https://socket.io/docs/v4/client-installation/#standalone-build 
const socket = io()
socket.on("connect", () => { 
  console.log("Connected to the webserver.")
})
socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.") 
})
socket.on("example_data", (obj) => {
   console.log(obj)
})
function Task_2() { 
	clearChart();
    // Set the data for the chart
var data = [4, 8, 15, 16, 23, 42];

// Set the dimensions of the canvas
var margin = {top: 20, right: 30, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// Set the ranges of the axes
var x = d3.scaleBand()
	.range([0, width])
	.padding(0.1);
var y = d3.scaleLinear()
	.range([height, 0]);

// Create the SVG canvas
var svg = d3.select("#chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scale the range of the data
x.domain(data.map(function(d) { return d; }));
y.domain([0, d3.max(data, function(d) { return d; })]);

// Add the bars to the chart
svg.selectAll(".bar")
	.data(data)
	.enter().append("rect")
	.attr("class", "bar")
	.attr("x", function(d) { return x(d); })
	.attr("width", x.bandwidth())
	.attr("y", function(d) { return y(d); })
	.attr("height", function(d) { return height - y(d); });

// Add the x-axis to the chart
svg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x));

// Add the y-axis to the chart
svg.append("g")
	.call(d3.axisLeft(y));

  
}
