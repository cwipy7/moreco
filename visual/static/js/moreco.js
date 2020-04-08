chosen_tags = []

// console.log(window.location.pathname)

var margin = {
    top: 25,
    right: 25,
    bottom: 15,
    left: 125
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
    .style("font-size", "16")

svg_barchart.append("g")
    .attr("class", "x_axis")
    .call(xAxis_bar)
    .selectAll("text")
    .attr("transform", "translate(0,-30)" )
    .style("font-size", "16")

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


// d3.text("/visit-sequences").then(function(text) {

//     var csv = d3.csvParseRows(text);
//     console.log(csv)
//     var json = buildHierarchy(csv);
//     createVisualization(json);
    
// });

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

    // var percentage = (100 * d.value / totalSize).toPrecision(3);
    // var percentageString = percentage + "%";
    // if (percentage < 0.1) {
    //   percentageString = "< 0.1%";
    // }

    percentageString = d.data.name
  
    image_link = 'https://m.media-amazon.com/images/M/MV5BNGQwZjg5YmYtY2VkNC00NzliLTljYTctNzI5NmU3MjE2ODQzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UX182_CR0,0,182,268_AL_.jpg'

    d3.select("#percentage")
        .text(percentageString);
  
    d3.select("#explanation")
        .style('content', 'url('+image_link+')')
        .style("visibility", "");
  
    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, percentageString);
  
    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);
  
    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function(node) {
                  return (sequenceArray.indexOf(node) >= 0);
                })
        .style("opacity", 1);
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
      var sequence = csv[i][0];
      var size = +csv[i][1];
      if (isNaN(size)) { // e.g. if this is a header row
        continue;
      }
      var parts = sequence.split("-");
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
       childNode = {"name": nodeName, "size": size};
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
        .data(nodeArray, function(d) { return d.data.name + d.depth; });
  
    // Remove exiting nodes.
    trail.exit().remove();
  
    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");
  
    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function(d) { return colors[d.data.name]; });
  
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

// Create drag and drop tag elements
var dragndrop = d3.select("#dragndrop"),
    width_dragndrop = +dragndrop.attr("width"),
    height_dragndrop = +dragndrop.attr("height");

radius = 20;
var rect_data = d3.range(1).map(function() {
    return{
        x : Math.round(width_dragndrop),
        y : Math.round(height_dragndrop)
    }; 
});

var rects = d3.select("#dragndrop")
	.append("g")
	.attr("class", "rects")
	.selectAll("rect")
        .data(rect_data)
        .enter()
        .append("rect")
        .attr("x", function(d) {return(d.x)})
        .attr("y", function(d) {return(d.y)})
        .attr("width", 100)
        .attr("height", 50)
        .attr("fill", "black"); 

var drag_handler = d3.drag().on("drag", function(d) {
        d3.select(this)
        .attr("x", d.x = d3.event.x  )
        .attr("y", d.y = d3.event.y  );
        }); 
drag_handler(rects);    


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
            // console.dir(items)
            chosen_tags = items
            console.log(chosen_tags)
            csv = []
            for (var j = 0; j < chosen_tags.length; j++) {
                csv[j] = chosen_tags[0].tag + '-'
                
                for (var i = 1; i < chosen_tags.length; i++) {
                    if (i != chosen_tags.length -1) {
                        csv[j] += chosen_tags[i].tag + '-'
                    }
                    else {
                        csv[j] += chosen_tags[i].tag + ',1'
                    }
                }
            }

            csv_arrays = []

            csv.forEach(function(d) {
                csv_arrays.push(d.split(','))
            })
            
            // console.log(csv_arrays)
            
            chosen_tags.forEach(function(d, i) {
                colors[d.tag] = color_scale(i)
            })

            var json = buildHierarchy(csv_arrays);
            createVisualization(json);
        }
    };

    $("#transfer1").transfer(settings);

});

function send_tags_to_server() {
    // console.log(chosen_tags)
    console.log("Processing Similarity Metric...")
    console.log(chosen_tags)
    $.ajax({
        type: "POST",
        url: "/tagselection",
        contentType: "application/json",
        data: JSON.stringify(chosen_tags),
        dataType: "json",
        success: function(response) {
            console.log(response);
            display_top_movies_barchart(response.data);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function display_top_movies_barchart(top_selection) {

    top_selection.sort(function(x, y){
        return d3.ascending(x.relevance_score, y.relevance_score)
    })

    y_bar.domain(
        top_selection.map(function (d) {
        return d.id;
    }));

    yAxis_bar = d3.axisLeft(y_bar)
                .tickSize(3)

    console.log(top_selection)
    bars_bar.data(top_selection).enter().exit().remove()

    bars_bar.select(".bar")
        .attr("y", function (d) {
            console.log(d.id)
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
            
            image_link = 'https://m.media-amazon.com/images/M/MV5BNTJjNmIzYWItNDE4OC00ZWQ3LWI0YzctODQyMTZjM2QxOWJhXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_UY268_CR2,0,182,268_AL_.jpg'
            tool_tip.html(
                "Movie: " + d.id + "<br/>" + "Relevance: " + d.relevance_score 
                + "<br/>" + "<img src=" + image_link + ">")
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