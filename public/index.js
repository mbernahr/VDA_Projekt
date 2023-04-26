function Task_1() {
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
  
}
