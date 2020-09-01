// setup the svg area
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var labelArea = 110;
var padding = 45;
// ****************************************************

// create svg 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// ****************************************************
// add g for x axis labels
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// transform x label
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

// build xText 
xText.append("text")
    .attr("y", -20)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 20)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");


// ****************************************************
// add g for y axis labels
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// transform y label
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );

// build yText 
yText .append("text")
    .attr("y", 20)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", -20)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");


// ****************************************************    
// define circle radius - responsive
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// ****************************************************    
// read in data as promise
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // default X & Y labels

   var currentY = "healthcare";

   // ****************************************************    
   // // build the text box
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //  format the numbers - %
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    // append tooltip to svg
    svg.call(toolTip);

    // ****************************************************    
    // axis click - update
    function  labelUpdate(axis, clickText) {
        // Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        // switch the text just clicked to active
        clickText.classed("inactive", false).classed("active", true);
        }

    // **************************************************** 
    // Scaling       
    // determine min and max for scaling
    
    function xMinMax() {
        xMin = d3.min(csvData, function(d) {
          return parseFloat(d[currentX]) * 0.85;
        });
        xMax = d3.max(csvData, function(d) {
          return parseFloat(d[currentX]) * 1.15;
        });     
      }
  
      function yMinMax() {
        yMin = d3.min(csvData, function(d) {
          return parseFloat(d[currentY]) * 0.85;
        });
        yMax = d3.max(csvData, function(d) {
          return parseFloat(d[currentY]) * 1.15;
        }); 
      }

    
    // append x and y axis 
    xMinMax();
    yMinMax();


    // **************************************************** 
    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // create scaled X and Y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    // **************************************************** 
    // calculate X and Y tick counts
    function tickCount() {
      if (width <= 530) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    // **************************************************** 
    // append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // **************************************************** 
    // append the circles for each state
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            // xScale figures the pixels
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // Show tooltip when mouse is on circle
            toolTip.show(d, this);
            // Highlight circle border
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            // Remove the tooltip
            toolTip.hide(d);
            // Remove the highlight
            d3.select(this).style("stroke", "#e3e3e3")
        });

        // **************************************************** 
        // apply state text on circles  - dx & dy are locations
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              // Push text to center by a 1/3
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

            // **************************************************** 
          // dynamic graph on click
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // select inactive
              if (self.classed("inactive")) {
                // grab axis and data name
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  // update min and max of domain (x)
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  
                  labelUpdate(axis, self);
                }

                 // update for Y axis selection 
                else {
                  currentY = name;

                  // update min and max of range (y)
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  // update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           // center text
                            return yScale(d[currentY]) + cRadius/3;                          
                        });
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}
