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
  } else if (chartType === "lda") {
    draw_lda(preprocessedData);
  } else {
    console.error("Unknown chart type received: ", chartType);
  }

});

function clearChart() {
  d3.select("#chart svg").remove();
}

///////////////////////////////////////////// colorblind Modus /////////////////////////////////////////////

var colorblindMode = false;

// Original colors
var colorCircleFill = "steelblue"
var colorCircleStroke = "steelblue"
var colorRegressionLine = "red";

// Create a colorblind-friendly color scale
let colorScale = d3.scaleOrdinal(d3.schemeBlues[9]);

function toggleColorblindMode() {
  colorblindMode = !colorblindMode;
  if (colorblindMode) {
    // Change colors to be colorblind friendly
    d3.selectAll("circle")
      .attr("fill", function (d, i) {
        // Use the color scale to assign colors
        return colorScale(i);
      })
    // Change regression line color
    d3.selectAll(".regression-line")
      .attr("stroke", "orange");
  } else {
    // Change colors back to the original colors
    d3.selectAll("circle")
      .attr("fill", colorCircleFill)
    d3.selectAll(".regression-line")
      .attr("stroke", colorRegressionLine);
  }
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
    "types",
    "title",
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

  // Combine minplayer and maxplayer into a single average player variable
  const avg_player = df_scatter.map((d) =>
    (d.minplaytime + d.maxplaytime) / 2
  );

  // Group and calculate the average "minage" by year and then add this as a new property to every game object in "df_scatter"
  const groupByYear = data.reduce((groups, item) => {
    const year = item.year;
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(item.minage);
    return groups;
  }, {});

  const avgMinageByYear = Object.keys(groupByYear).map(year => {
    const minages = groupByYear[year];
    const avgMinage = minages.reduce((total, minage) => total + minage, 0) / minages.length;
    return { [year]: avgMinage };
  }).reduce((acc, cur) => ({ ...acc, ...cur }), {});

  df_scatter.forEach((d) => {
    d.avg_minage = avgMinageByYear[d.year];
  });

  // Extract the 'rating' column into a separate Series
  const pd_avg_rating = df_scatter.map((d) => d.rating.rating);

  // Add the pd_avg_rating array as a new property to the df_scatter array
  df_scatter.forEach((d, i) => {
    d.avg_rating = pd_avg_rating[i];
  });

  // Extract the 'number of ratings' column into a seperate Series
  const pd_num_of_reviews = df_scatter.map((d) => d.rating.num_of_reviews)

  // Add the pd_num_of_reviews array as a new property to the df_scatter array
  df_scatter.forEach((d, i) => {
    d.num_of_reviews = pd_num_of_reviews[i];
  });

  // Drop the unused properties
  df_scatter.forEach((d) => {
    delete d.minplaytime;
    delete d.maxplaytime;
    delete d.rating;
    //delete d.minplayers;
    //delete d.maxplayers;
  });

  // Return the preprocessed data as an array of objects
  console.log("Preprocessed data:", df_scatter)
  return df_scatter;
};

////////////////////////////////////////////////// Task_1 //////////////////////////////////////////////////

function Task_1() {
  chartType = "scatterplot"
  socket.emit("get_boardgames_data")
}

function draw_scatterplot_and_regressionline(data) {
  clearChart();
  colorblindMode = false;

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
    .domain([d3.min(data, d => d.avg_playtime) * 0.95, d3.max(data, d => d.avg_playtime) * 1.05])
    .range([0, width]);

  // Define the y-axis scale based on average rating
  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.avg_rating) * 0.95, d3.max(data, d => d.avg_rating) * 1.05])
    .range([height, 0]);


  // Define tooltip div
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create and position circle elements for each data point
  var circles = svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.avg_playtime))
    .attr('cy', d => yScale(d.avg_rating))
    .attr('r', 5)
    .attr('fill', colorCircleFill)
    .attr("stroke", colorCircleStroke)
    .attr("stroke-width", 1.5)
    // Add hover effect
    .on('mouseover', function (event, d) {
      // Change the size of the data points bigger
      d3.select(this).transition()
        .duration('100')
        .attr("r", 7);
      // Showing value on hover
      div.transition()
        .duration(100)
        .style("opacity", 1);
      div.html(
        "Titel: " + d.title +
        "<br>Playtime: " + d3.format(".2f")(d.avg_playtime) +
        ", Rating: " + d3.format(".2f")(d.avg_rating)
      )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on('mouseout', function (event, d) {
      // Change the size of the data points smaller
      d3.select(this).transition()
        .duration('200')
        .attr("r", 5);
      div.transition()
        .duration('200')
        .style("opacity", 0);
    });

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
  // const polynomialOrder = 2;
  // const regressionResult = regression.polynomial(data.map(d => [d.avg_playtime, d.avg_rating]), { order: polynomialOrder });
  const regressionResult = regression.logarithmic(data.map(d => [d.avg_playtime, d.avg_rating]));

  // Create a function to calculate the y-coordinate of the regression line for any given x-coordinate
  const regressionLine = x => regressionResult.predict(x)[1];

  // Create an array of x-coordinates for the regression line
  const numPoints = 25
  const xCoords = d3.range(
    d3.min(data, d => d.avg_playtime),
    d3.max(data, d => d.avg_playtime),
    (d3.max(data, d => d.avg_playtime) - d3.min(data, d => d.avg_playtime)) / numPoints
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
    .attr("class", "regression-line")
    .attr("stroke", colorRegressionLine)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5,5")
    .attr("d", lineGenerator);

  console.log('Coefficients:', regressionResult.equation);

}
////////////////////////////////////////////////// Task_2 //////////////////////////////////////////////////

function Task_2() {
  chartType = "timeline"
  socket.emit("get_boardgames_data")
}

function draw_year_minage_timeline(data) {
  clearChart();
  colorblindMode = false;

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
    .text("Average Minimum Playerage per Year");

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
    .attr('x', -height / 3)
    .attr('fill', 'black')
    .attr("font-size", "16px")
    .text('Average Minimum Age');

  // Create a line generator function
  const lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.avg_minage));

  // Sort the data by year to ensure the line connects points in the correct order
  data.sort((a, b) => a.year - b.year);

  // Create and position the line path
  svg.append('path')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2);

  // Define tooltip div
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create and position circle elements for each data point
  var circles = svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.year))
    .attr('cy', d => yScale(d.avg_minage))
    .attr('r', 5)
    .attr('fill', colorCircleFill)
    .attr("stroke", colorCircleStroke)
    .attr("stroke-width", 1.5)
    // Add hover effect
    .on('mouseover', function (event, d) {
      // Change the size of the data points bigger
      d3.select(this).transition()
        .duration('100')
        .attr("r", 7);
      // Showing value on hover
      div.transition()
        .duration(100)
        .style("opacity", 1);
      div.html("Year: " + (d.year) + ", avg. min. Age: " + (d.avg_minage))
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on('mouseout', function (event, d) {
      // Change the size of the data points smaller
      d3.select(this).transition()
        .duration('200')
        .attr("r", 5);
      div.transition()
        .duration('200')
        .style("opacity", 0);
    });
}

////////////////////////////////////////////////// Task_3 //////////////////////////////////////////////////

function Task_3() {
  chartType = "lda"
  socket.emit("get_boardgames_data")
}

function draw_lda(data) {
  clearChart();
  colorblindMode = false;

  ///////////// preprocess for LDA //////////// 
  // Create a array with the most dominant game category from each game
  var classCounts = {};
  for (let game of data) {
    for (let count of game.types.categories) {
      if (!classCounts.hasOwnProperty(count.name)) {
        classCounts[count.name] = 1;
      } else {
        classCounts[count.name]++;
      }
    }
  }

  let highestOrderedCategories = [];
  for (let game of data) {
    let tmp = [];
    for (let count of game.types.categories) {
      tmp.push(count.name)
    }
    tmp.sort((a, b) => classCounts[b] - classCounts[a]);
    if (tmp.length > 0) {
      highestOrderedCategories.push(tmp[0]);
    }
  }
  console.log("highestOrderedCategories: ", highestOrderedCategories);

  // Create a array with only the numerical data from each game
  var numberData = []
  const title = []

  for (let game of data) {
    var tmp = [];
    tmp.push(game.avg_rating)
    tmp.push(game.num_of_reviews)
    tmp.push(game.avg_playtime)
    tmp.push(game.minage)
    tmp.push(game.minplayers)
    tmp.push(game.maxplayers)
    //tmp.push(game.year)

    title.push(game.title)
    numberData.push(tmp)
  }

  console.log("numberData:", numberData)

  // Filter data to contain only games belonging to the top 3 categories
  const topThreeCat = ["Fantasy", "Economic", "Science Fiction"];

  for (let i = highestOrderedCategories.length - 1; i >= 0; i--) {
    const category = highestOrderedCategories[i];
    
    if (!topThreeCat.includes(category)) {
      highestOrderedCategories.splice(i, 1);
      numberData.splice(i, 1);
      title.splice(i, 1);
    }
  }


  console.log("highestOrderedCategories Post:", highestOrderedCategories)
  console.log("numberData Post:", numberData)


  // LDA wit 2 dimensions
  const X = druid.Matrix.from(numberData);

  const reductionLDA = new druid.LDA(X, { labels: highestOrderedCategories, d: 2 })
  const result = reductionLDA.transform()

  console.log(result.to2dArray)

  //////////////// plott the LDA /////////////// 
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
    .text("LDA dimensionality reduction ");

  // Create color scale
  var numColor = Array.from(new Set(highestOrderedCategories)).length
  var color = d3.scaleOrdinal(d3.schemeCategory10)
    //.domain([0, numColor])
    //.range(d3.quantize(t => d3.interpolateRainbow(t), numColor));
    /////// Add self created array with colors because they are better to disginguish
    //.domain(Array.from(new Set(highestOrderedCategories)))
    //.range(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896",
    //  "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
    //  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5", "#6b6ecf", "#b5cf6b"]);

  // Create scales for the axes
  /////// Get the min and max of the values, calculate the range and add 10% padding
  var xExtent = d3.extent(result, d => d[0]);
  var xRange = xExtent[1] - xExtent[0];
  var xScale = d3.scaleLinear()
    .domain([xExtent[0] - xRange * 0.1, xExtent[1] + xRange * 0.1])
    .range([0, width]);

  var yExtent = d3.extent(result, d => d[1]);
  var yRange = yExtent[1] - yExtent[0];
  var yScale = d3.scaleLinear()
    .domain([yExtent[0] - yRange * 0.1, yExtent[1] + yRange * 0.1])
    .range([height, 0]);


  // Create axes
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Append the axes to the SVG
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // Create the scatterplot
  var circles = svg.selectAll(".dot")
    .data(result)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", function (d, i) { return xScale(d[0]); })
    .attr("cy", function (d, i) { return yScale(d[1]); })
    .style("fill", function (_, i) { return color(highestOrderedCategories[i]); });

  // Define tooltip div
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Get unique categories for the legend by using Set
  let uniqueCategories = Array.from(new Set(highestOrderedCategories));

  // Legend
  var legend = svg.selectAll(".legend")
    .data(uniqueCategories)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (_, i) { return "translate(" + (width + 20) + "," + i * 20 + ")"; });

  // Draw legend colored rectangles
  legend.append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  // Draw legend text
  legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function (d) { return d; });


  // Add hover effect
  /////// Helper variable to find the index
  const results = result.to2dArray
  circles
    .on('mouseover', function (event, d) {
      // Change the size of the data points bigger
      d3.select(this)
        .attr("r", 7);
      // Showing value on hover
      div.transition()
        .duration(100)
        .style("opacity", 1);

      // Search for Index
      let index = results.findIndex(item => item[0] === d[0] && item[1] === d[1]);

      div.html("Titel: " + title[index] + "<br>Categorie: " + highestOrderedCategories[index])
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on('mouseout', function (event, d) {
      // Change the size of the data points smaller
      d3.select(this)
        .attr("r", 5);
      div.transition()
        .duration('200')
        .style("opacity", 0);
    });

}