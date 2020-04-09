chosen_tags = []
sunburst_hover_paths = []
sunburst_hover_prediction = []
recommendations = []
sunburst_images = []

// console.log(window.location.pathname)

var margin = {
    top: 25,
    right: 25,
    bottom: 15,
    left: 300
};

// hack: top 10 movies bar chart
sample_movie = 
    [{'id': 'kungfu1', 'relevance_score': '0.71'}, 
     {'id': 'kungfu2', 'relevance_score': '0.72'}, 
     {'id': 'kungfu3', 'relevance_score': '0.73'}, 
     {'id': 'kungfu4', 'relevance_score': '0.74'}, 
     {'id': 'kungfu5', 'relevance_score': '0.75'},
     {'id': 'kungfu6', 'relevance_score': '0.76'},
     {'id': 'kungfu7', 'relevance_score': '0.77'},
     {'id': 'kungfu8', 'relevance_score': '0.78'},
     {'id': 'kungfu9', 'relevance_score': '0.79'},
     {'id': 'kungfu10', 'relevance_score': '0.80'}];

var width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// Movie Relevance Chart

var svg_barchart = d3.select("#barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('class', 'barchart')
    .style("visibility", "hidden");

var tool_tip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var x_bar = d3.scaleLinear()
    .range([0, width])
    .domain([0, 1]);

var y_bar = d3.scaleBand()
    .range([height, 0])
    .domain(sample_movie.map(function (d) {
        return d.id;
    }));

var yAxis_bar = d3.axisLeft(y_bar)
    .tickSize(0)

var xAxis_bar = d3.axisBottom()
    .scale(x_bar).tickSize(5)

svg_barchart.append("g")
    .attr("class", "y_axis")
    .call(yAxis_bar)
    .style("font-size", "12")

svg_barchart.append("g")
    .attr("class", "x_axis")
    .call(xAxis_bar)
    .selectAll("text")
    .attr("transform", "translate(0,-30)" )
    .style("font-size", "12")

var bars_bar = svg_barchart.selectAll(".bar")
    .data(sample_movie)
    .enter()
    .append("g")

bars_bar.append("rect")
    .attr("class", "bar")
    .attr("y", function (d) {
        return y_bar(d.id);
    })
    .attr("height", y_bar.bandwidth())
    .attr("x", 0)
    .attr("width", function (d) {
        return x_bar(d.relevance_score);
    })
    .style("fill", "blue");


////////////////////////// Burst Movie Search ////////////////////////// 

var width_burst = 550;
var height_burst = 550;
var radius = Math.min(width_burst, height_burst) / 2;

var b = {
    w: 75, h: 30, s: 3, t: 10
};

var colors = {};
var color_scale = d3.scaleOrdinal(d3.schemeCategory10);

var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width_burst)
    .attr("height", height_burst)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width_burst / 2 + "," + height_burst / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });


// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);
  
    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);
  
    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });
    
    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
        .filter(function(d) {
            return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        });
  
    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function(d) { return colors[d.data.name]; })
        .style("opacity", 1)
        .on("mouseover", mouseover);
  
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);
  
    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width_burst)
        .attr("height", 50)
        .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
      .attr("id", "endlabel")
      .style("fill", "#000");
}

function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
      legend.style("visibility", "");
    } else {
      legend.style("visibility", "hidden");
    }
}

function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
      w: 75, h: 30, s: 3, r: 3
    };
  
    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(colors).length * (li.h + li.s));
  
    var g = legend.selectAll("g")
        .data(d3.entries(colors))
        .enter().append("svg:g")
        .attr("transform", function(d, i) {
                return "translate(0," + i * (li.h + li.s) + ")";
             });
  
    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });
  
    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.key; });
  }

function mouseover(d) {  
    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    sequenceArray.forEach(function(d) {
        sunburst_hover_prediction.push(d.data.name)
    })
    reco_index = -1

    // Checks for array equality then returns index, to get the recommended entity (movie/director)
    for (var i = 0; i < sunburst_hover_paths.length; i++) {
        if (JSON.stringify(sunburst_hover_prediction) == JSON.stringify(sunburst_hover_paths[i])) {
            reco_index = i;
        }
    }
    var current_recommendation = "None"
    var current_image = "None"
    if (reco_index >= 0) {
        current_recommendation = recommendations[reco_index]
        current_image = 'url(' + sunburst_images[reco_index] + ')'
    }
    // console.log(current_recommendation)

    // console.log("reco_index")
    // console.log(sunburst_hover_paths)
    // console.log(sunburst_hover_prediction)
    // console.log(reco_index)
  
    d3.select("#percentage")
        .text(current_recommendation);
  
    d3.select("#explanation")
        .style('content', current_image)
        .style("visibility", "");

    updateBreadcrumbs(sequenceArray, current_recommendation);
  
    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);
  
    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function(node) {
                  return (sequenceArray.indexOf(node) >= 0);
                })
        .style("opacity", 1);

    sunburst_hover_prediction = [];
  }

function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");
  
    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);
  
    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .on("end", function() {
                d3.select(this).on("mouseover", mouseover);
              });
  
    d3.select("#explanation")
        .style("visibility", "hidden");
}

function buildHierarchy(csv) {
    var root = {"name": "root", "children": []};
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i];
    //   var size = +csv[i][1];
    //   if (isNaN(size)) { // e.g. if this is a header row
    //     continue;
    //   }
    //   var parts = sequence.split("+");
      var parts = sequence
    //   console.log(parts)
    //   console.log(size)
    //   var parts = sequence
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
     // Not yet at the end of the sequence; move down the tree.
       var foundChild = false;
       for (var k = 0; k < children.length; k++) {
         if (children[k]["name"] == nodeName) {
           childNode = children[k];
           foundChild = true;
           break;
         }
       }
    // If we don't already have a child node for this branch, create it.
       if (!foundChild) {
         childNode = {"name": nodeName, "children": []};
         children.push(childNode);
       }
       currentNode = childNode;
        } else {
       // Reached the end of the sequence; create a leaf node.
       childNode = {"name": nodeName, "size": 1};
       children.push(childNode);
        }
      }
    }
    return root;
};

function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function(d) { 
            return d.data.name + d.depth; });
  
    // Remove exiting nodes.
    trail.exit().remove();
  
    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");
  
    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function(d) {
            return colors[d.data.name]; });
  
    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.data.name; });
  
    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function(d, i) {
      return "translate(" + i * (b.w + b.s) + ", 0)";
    });
  
    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(percentageString);
  
    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
        .style("visibility", "");
  
}
////////////////////////////////////////////////////////////////////////////////////////////////   


d3.dsv(",", "/genome-tags").then(function(data) {
    director_array = []
    
    data.forEach(function(d) {
        director_array.push({
            'tag': d.tag,
            'value': d.tagId
        })
    })

    var settings = {
        "dataArray": director_array,
        "itemName": "tag",
        "callable": function (items) {
            chosen_tags = items
        }
    };

    $("#transfer1").transfer(settings);

});

function send_tags_to_server() {
    console.log("Processing Similarity Metric...")
    $.ajax({
        type: "POST",
        url: "/tagselection",
        contentType: "application/json",
        data: JSON.stringify(chosen_tags),
        dataType: "json",
        success: function(response) {
            console.log('done.')
            sunburst_data = response.data.pop().sunburst
            recommendations = sunburst_data.recommendation
            sunburst_images = sunburst_data.image
            sunburst_data = sunburst_data.path
            sunburst_hover_paths = sunburst_data
            
            // console.log("response!")
            // console.log(response.data);
            // console.log(sunburst_data);
            // console.log(recommendations)

            // Display barchart
            display_top_movies_barchart(response.data);

            // Set sunburst color scheme
            chosen_tags.forEach(function(d, i) {
                colors[d.tag] = color_scale(i)
                // console.log(colors[d.tag])
            })

            // Build Sunburst chart
            var json = buildHierarchy(sunburst_data);
            createVisualization(json);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function display_top_movies_barchart(top_selection) {

    top_selection.sort(function(x, y){
        return d3.descending(x.relevance_score, y.relevance_score)
    })

    y_bar.domain(
        top_selection.map(function (d) {
        return d.id;
    }));

    yAxis_bar = d3.axisLeft(y_bar)
                .tickSize(3)

    bars_bar.data(top_selection).enter().exit().remove()

    bars_bar.select(".bar")
        .attr("y", function (d) {
            // console.log(d.id)
            return y_bar(d.id);
        })
        .attr("height", y_bar.bandwidth() - 2)
        .attr("x", 0)
        .attr("width", function (d) {
            return x_bar(d.relevance_score);
        })
        .on("mouseover", function(d) {
            d3.select(this).style("fill", "orange");

            tool_tip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            
            tool_tip.html(
                "Movie: " + d.id + "<br/>" + "Relevance: " + d.relevance_score 
                + "<br/>" + "<img src=" + d.img_link + ">")
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", "blue");
            tool_tip.transition()		
                .duration(500)		
                .style("opacity", 0);
        });
        

    svg_barchart.select(".y_axis").call(yAxis_bar)
    svg_barchart.style("visibility", "visible");

}