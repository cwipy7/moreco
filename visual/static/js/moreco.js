chosen_tags = []
sunburst_hover_paths = []
sunburst_hover_prediction = []
recommendations = []
sunburst_images = []
movie_trailers = []
tag_barchart_scores = []
current_recommendation = 'None'
current_image = 'None'
current_img_tooltip = "None"
current_trailer = 'None'

var csv;
var Oids = [];

// console.log(window.location.pathname)

var tool_tip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.select("#trailer")
    .style("visibility", "hidden")

// Tag Bar Chart
var svg_tagchart = d3.select("#tagchart"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg_tagchart.attr("width") - margin.left - margin.right,
    height = +svg_tagchart.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg_tagchart.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("visibility", "hidden");

////////////////////////// Burst Movie Search ////////////////////////// 



var width_burst = 500;
var height_burst = 500;
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

// var json = buildHierarchy([['tag1'],['tag2']]);
// createVisualization(json);


function create_SunBurst(json) {

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
        .on("mouseover", mouseover)
        .on("click", sunburst_click);
  
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave)
    // .style("visibility", "hidden");
  
    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};

function update_SunBurst(json) {

    // Basic setup of page elements.
    updateBreadcrumbTrail();
    updateLegend();
    d3.select("#togglelegend").on("click", toggleLegend);
  
    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.select("circle")
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
        .enter().select("path")
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function(d) { return colors[d.data.name]; })
        .style("opacity", 1)
        .on("mouseover", mouseover)
        .on("click", sunburst_click);
  
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave)
    .style("visibility", "");
  
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
    // trail.append("svg:text")
    //   .attr("id", "endlabel")
    //   .style("fill", "#000");
}

function updateBreadcrumbTrail() {
    var trail = d3.select("#sequence").select("svg")
        .attr("width", width_burst)
        .attr("height", 50)
        .attr("id", "trail");
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

function updateLegend() {
    var li = {
      w: 75, h: 30, s: 3, r: 3
    };
  
    var legend = d3.select("#legend").select("svg")
        .attr("width", li.w)
        .attr("height", d3.keys(colors).length * (li.h + li.s));
  
    var g = legend.selectAll("g")
        .data(d3.entries(colors))
        .enter().select("g")
        .attr("transform", function(d, i) {
                return "translate(0," + i * (li.h + li.s) + ")";
             });
  
    g.select("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });
  
    g.select("svg:text")
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
    current_recommendation = "None"
    current_image = "None"
    current_img_tooltip = 'None'
    current_trailer = "None"

    if (reco_index >= 0) {
        current_recommendation = recommendations[reco_index]
        current_image = 'url(' + sunburst_images[reco_index] + ')'
        current_img_tooltip = sunburst_images[reco_index]
        current_trailer = 'https://www.youtube.com/embed/' + movie_trailers[reco_index]
    }
  
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

    // Sunburst Tooltip

    tool_tip.transition()		
        .duration(200)		
        .style("opacity", .9);		

    tool_tip.html(current_recommendation)
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");

    sunburst_hover_prediction = [];

    update_tag_barchart(reco_index);

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

    tool_tip.transition()		
        .duration(500)		
        .style("opacity", 0);
}

function sunburst_click(d) {
    // console.log("sunburst click")
    // console.log(d.data.name)
    tool_tip.html(
        current_recommendation + "<br>" +
        "<img src=" + current_img_tooltip + "/>"
        )
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");
    
    d3.select("#trailer")
        .attr("src", current_trailer)
        .style("visibility", "")
    

}



function buildHierarchy(csv) {
    var root = {"name": "root", "children": []};
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i];
      var parts = sequence
    //   console.log("PARTS")
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
    // d3.select("#trail").select("#endlabel")
    //     .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
    //     .attr("y", b.h / 2)
    //     .attr("dy", "0.35em")
    //     .attr("text-anchor", "middle")
    //     .text(percentageString);
  
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
            temp_scores = sunburst_data.tag_scores
            console.log(temp_scores)
            for (var i = 0; i < temp_scores.length; i++) {
                for (var j = 0; j < temp_scores[i].length; j++) {
                    tag_barchart_scores.push({
                        'group': i,
                        'tag': temp_scores[i][j][0],
                        'score': temp_scores[i][j][1]
                    })
                }
            }

            recommendations = sunburst_data.recommendation
            sunburst_images = sunburst_data.image
            movie_trailers = sunburst_data.trailer
            sunburst_data = sunburst_data.path
            sunburst_hover_paths = sunburst_data
            
            // console.log("response!")
            // console.log(response.data);
            // console.log(sunburst_data);
            // console.log(recommendations)
            // console.log(tag_barchart_scores)
            // console.log("PATHS")
            // console.log(sunburst_hover_paths)


            max_length_path = 0
            for (var i = 0; i < sunburst_data.length; i++) {
                if (sunburst_data[i].length > max_length_path) {
                    max_length_path = sunburst_data[i].length
                }
            }

            console.log(max_length_path)
            
            largest_paths = []
            sunburst_data.forEach(function(d) {
                if (d.length === max_length_path) {
                    largest_paths.push(d)
                }
            })


            // Set sunburst color scheme
            chosen_tags.forEach(function(d, i) {
                colors[d.tag] = color_scale(i)
                // console.log(colors[d.tag])
            })

            // Build Sunburst chart
            // console.log(largest_paths)
            var json = buildHierarchy(largest_paths);
            create_SunBurst(json);

            // Build Tag Bar Chart
            csv = tag_barchart_scores
            console.log(csv)
            // filter the data based on the inital value
            var data = csv.filter(function(d) { 
                var sq = 0
                console.log(sq)
                return d.group == sq;
            });


            var Oids = []
                data.forEach(d => Oids.push(d.tag))
                console.log(Oids)

            // set the domains of the axes
            x.domain(data.map(function(d) { return d.tag; }));
            y.domain([0, 1]);

            // add the svg elements
            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10, "%"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");

            // create the bars
            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("id", function(d) { return d.tag; })
                .attr("x", function(d) { return x(d.tag); })
                .attr("y", function(d) { return y(d.score); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.score); })
                .attr("fill", function(d) {return colors[d.tag]});
            
                
            g.selectAll(".label")
                .data(data).enter()
                .append("text")
                .attr("class", "label")
                .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
                .attr("y", function (d) { return y(d.score) - 20; })
                .attr("dy", ".75em")
                .text(function (d) { return d.score.toFixed(2) * 100 + "%"; });


        },
        error: function(err) {
            console.log(err);
        }
    });
}

function update_tag_barchart(value) {
    // filter the data
    var data = csv.filter(function(d) {return d.group == value;})
      console.log(data)
    var ids = []
    data.forEach(d => ids.push(d.tag))
    // console.log("current set")
    // console.log(Oids)

    // console.log("entry set")
    // console.log(ids)

    var toBoot = []
    var toKeep = []
    Oids.forEach(gatekeep)

    function gatekeep(entry){
        if (ids.includes(entry)) {
            toKeep.push(entry)
        }
        else{
            toBoot.push(entry)
        }
    }
    // console.log("To keep")
    // console.log(toKeep)
    // console.log("To boot")
    // console.log(toBoot)
    Oids = ids

    // update the bars
    x.domain(data.map(function(d) { 
        //console.log(d.letter)
        return d.tag; }));

    toBoot.forEach(kick)

    function kick(can){
        // console.log("removing: " + can)
    }

    g.select("g")
      .attr("class", "axis axis--x")   
      .transition().duration(100)  
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    var bars = svg_tagchart.select("g").selectAll(".bar")
      .data(data);
    
    var bar_labels = svg_tagchart.select("g").selectAll(".label")
        .data(data);

    //remove unneeded bars                
    bars.exit().remove();
    bar_labels.exit().remove()

    //create any new bars needed
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("id", function(d) { return d.tag; })
      .attr("x", function(d) { return x(d.tag); })
      .attr("y", function(d) { return y(d.score); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.score); })
      .attr("fill", function(d) {return colors[d.tag]});

    bar_labels.enter().append("text")
        .attr("class", "label")
        .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
        .attr("y", function (d) { return y(d.score) - 20; })
        .attr("dy", ".75em")
        .text(function (d) { return d.score.toFixed(2) * 100 + "%"; });

    //update to new positions
    bars.transition().duration(1000)
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.tag); })
      .attr("y", function(d) { return y(d.score); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.score); })
      .attr("fill", function(d) {return colors[d.tag]});

    bar_labels.transition().duration(1000)
      .attr("class", "label")
      .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
      .attr("y", function (d) { return y(d.score) - 20; })
      .attr("dy", ".75em")
      .text(function (d) { return d.score.toFixed(2) * 100 + "%"; });

    svg_tagchart.select("g").style("visibility", "")

}