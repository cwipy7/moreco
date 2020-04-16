chosen_tags = []
sunburst_hover_paths = []
sunburst_hover_prediction = []
recommendations = []
sunburst_images = []
movie_trailers = []
tag_barchart_scores = []
movie_metadata = []
current_recommendation = 'None'
current_image = 'None'
current_img_tooltip = "None"
current_trailer = 'None'
current_metadata = 'None'

mouseover_disable = false


// Loading Spinner
var opts = {
    lines: 9, // The number of lines to draw
    length: 9, // The length of each line
    width: 5, // The line thickness
    radius: 14, // The radius of the inner circle
    color: '#EE3124', // #rgb or #rrggbb or array of colors
    speed: 1.9, // Rounds per second
    trail: 40, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
    left: '30%'
  };


// Tag Barchart vars
var csv;
var Oids = [];
var barcounts;
var svg_tagchart;
var x, y;
var g;

// console.log(window.location.pathname)

// d3.select("#body").attr("width", "10%").attr("height", "10%")

// Instructions: How to use Moreco

d3.select("#toggleinstructions").on("click", toggleInstructions);
d3.select("#toggle_text")
  .text("Instructions")

d3.select("#instruction1")
  .text("1. Search for and select up to 5 tags (Use the '>' to add and '<' to remove).")
  .style("color", "yellow")
  .style("text-shadow", "2px 2px black")
  .style("font-weight", "bold")

d3.select("#instruction2")
  .text("2. Click Find Movies!")
  .style("color", "white")
  .style("font-weight", "bold")
  .style("text-shadow", "2px 2px black")
  .style("font-weight", "bold")

d3.select("#instruction3")
  .text("3. Hover over tag arcs to get recommendations. Tags in the inner circles")
  .style("color", "white")
  .style("text-shadow", "2px 2px black")
  .style("font-weight", "bold")

d3.select("#instruction4")
  .text("will be weighed more heavily than those in the outer circles.")
  .style("color", "white")
  .style("text-shadow", "2px 2px black")
  .style("font-weight", "bold")

d3.select("#instruction5")
   .text("4. Click the tag arc to get more info about the movie.")
   .style("color", "white")
   .style("text-shadow", "2px 2px black")
  .style("font-weight", "bold")
         


// Tooltip create
var tool_tip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.select("#trailer")
    .style("visibility", "hidden")

// Tag Bar Chart
function create_tag_barchart() {
    svg_tagchart = d3.select("#tagchart"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg_tagchart.attr("width") - margin.left - margin.right,
    height = +svg_tagchart.attr("height") - margin.top - margin.bottom;

    x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

    g = svg_tagchart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("visibility", "hidden");
}

////////////////////////// Burst Movie Search //////////////////////////
var width_burst = 500;
var height_burst = 500;
var radius = Math.min(width_burst, height_burst) / 2;

var b = {
    w: 100, h: 30, s: 3, t: 10
};

var colors = {};
var color_scale = ['#f7bf0e', '#38ab39', '#ec181e', '#9c4cce', '#1584f4'];

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

var json = buildHierarchy([['tag1'],['tag2']]);
create_SunBurst(json);
d3.select("#container").style("visibility", "hidden");


function create_SunBurst(json) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend")
    .on("click", toggleLegend)
     .style("color", "white");

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
    .style("visibility", "");

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};


function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width_burst+100)
        .attr("height", 50)
        .attr("id", "trail");
    // Add the label at the end, for the percentage.
    // trail.append("svg:text")
    //   .attr("id", "endlabel")
    //   .style("fill", "#000");
}

function updateBreadcrumbTrail() {
    var trail = d3.select("#sequence").select("svg").select("svg")
        .attr("width", width_burst+100)
        .attr("height", 50)
        .attr("id", "trail");
}

function toggleLegend() {
    var legend = d3.select("#legend");
    legend.style("visibility", "");
//    if (legend.style("visibility") == "hidden") {
//      legend.style("visibility", "");
//    } else {
//      legend.style("visibility", "hidden");
//    }
}

function toggleInstructions() {

    d3.select("#instruction1")
      .text("1. Search for and select up to 5 tags (Use the '>' to add and '<' to remove).")
      .style("color", "yellow")
      .style("text-shadow", "2px 2px black")
      .style("font-weight", "bold")

    d3.select("#instruction2")
      .text("2. Click Find Movies!")
      .style("color", "white")
      .style("font-weight", "bold")
      .style("text-shadow", "2px 2px black")
      .style("font-weight", "bold")

    d3.select("#instruction3")
      .text("3. Hover over tag arcs to get recommendations. Tags in the inner circles")
      .style("color", "white")
      .style("text-shadow", "2px 2px black")
      .style("font-weight", "bold")

    d3.select("#instruction4")
      .text("will be weighed more heavily than those in the outer circles.")
      .style("color", "white")
      .style("text-shadow", "2px 2px black")
      .style("font-weight", "bold")

    d3.select("#instruction5")
       .text("4. Click the tag arc to get more info about the movie.")
       .style("color", "white")
       .style("text-shadow", "2px 2px black")
      .style("font-weight", "bold")

    var instruction = d3.select("#instruction1");
    if (instruction.style("visibility") == "hidden") {
        d3.select("#instruction1").style("visibility", "");
        d3.select("#instruction2").style("visibility", "");
        d3.select("#instruction3").style("visibility", "");
        d3.select("#instruction4").style("visibility", "");
        d3.select("#instruction5").style("visibility", "");
        d3.select("#trailer").style("visibility", "hidden");
    } else {
        d3.select("#instruction1").style("visibility", "hidden");
        d3.select("#instruction2").style("visibility", "hidden");
        d3.select("#instruction3").style("visibility", "hidden");
        d3.select("#instruction4").style("visibility", "hidden");
        d3.select("#instruction5").style("visibility", "hidden");
        d3.select("#trailer").style("visibility", "");
    }
}

function drawLegend() {
    var li = {
      w: 75, h: 30, s: 3, r: 3
    };

    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w*2)
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
        .attr("width", li.w*2)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });

    g.append("svg:text")
        .attr("x", 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .style("fill", "black")
//         .style("text-shadow", "1px 1px black")
        .text(function(d) { return d.key.substring(0,20); });
}


function mouseover(d) {
    if (mouseover_disable === false) {
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
        current_metadata = "None"

        if (reco_index >= 0) {
            current_recommendation = recommendations[reco_index]
            current_image = 'url(' + sunburst_images[reco_index] + ')'
            current_img_tooltip = sunburst_images[reco_index]
            current_trailer = 'https://www.youtube.com/embed/' + movie_trailers[reco_index]
            current_metadata = movie_metadata[reco_index]
        }

        d3.select("#movie_title")
            .text(current_recommendation)
            .style("visibility", "");

        d3.select("#poster_in_circle")
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
            .style("opacity", 0);
        //     .duration(200)
        //     .style("width", "200px")
        //     .style("height", "20px")
        //     .style("text-align", "center")


        // tool_tip.html(current_recommendation)
        //     .style("left", (d3.event.pageX) + "px")
        //     .style("top", (d3.event.pageY - 28) + "px");

        sunburst_hover_prediction = [];

        update_tag_barchart(reco_index);

        d3.select("#instruction1")
            .text("1. Search for and select up to 5 tags (Use the '>' to add and '<' to remove).")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction2")
            .text("2. Click Find Movies!")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction3")
            .text("3. Hover over tag arcs to get recommendations. Tags in the inner circles")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction4")
            .text("will be weighed more heavily than those in the outer circles.")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")
        
        d3.select("#instruction5")
            .text("4. Click the tag arc to get more info about the movie.")
            .style("color", "yellow")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

    }

  }

function mouseleave(d) {

    if (mouseover_disable === false) {
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

        d3.select("#poster_in_circle")
            .style("visibility", "hidden");

        d3.select("#movie_title").style("visibility", "hidden");

        tool_tip.transition()
            .duration(500)
            .style("opacity", 0)
    }
}

function sunburst_click(d) {
    if (mouseover_disable === false) {
        // mouseover_disable = true

        // console.log(current_metadata)
        // console.log(current_recommendation)
        tool_tip.html("<br>" +
            "<img src=" + current_img_tooltip + "/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("text-align", "left")
            .style("width", "350px")
            .style("height", "300px")
            .style("opacity", .9);

        tool_tip.append("text").style("position", "absolute").style("left", "225px").style("font-size", "12px")
        .style("text-decoration", "underline")
        .text(current_recommendation)

        tool_tip.append("text").style("position", "absolute").style("top", "50px").style("left", "215px")
        .style("text-align", "left")
        .text("Year: " + current_metadata[1])

        tool_tip.append("text").style("position", "absolute").style("top", "100px").style("left", "215px")
        .style("text-align", "left")
        .text("Genre: " + current_metadata[2])

        tool_tip.append("text").style("position", "absolute").style("top", "150px").style("left", "215px")
        .style("text-align", "left")
        .text("Runtime: " + current_metadata[4] + " minutes")

        // tool_tip.append("a").style("position", "absolute").style("top", "200px").style("left", "215px")
        // .style("text-align", "left")
        // .text("imdb.com/title/" + current_metadata[0])

        tool_tip.append("text").style("position", "absolute").style("bottom", "20px").style("left", "190px")
        .style("text-align", "center").style("font-weight", "bold").style("font-size", "18px")
        .text("Watch the trailer below!")

        d3.select("#trailer")
            .attr("src", current_trailer)
            .style("visibility", "")

        d3.select("#instruction1")
            .style("visibility", "hidden")

        d3.select("#instruction2")
            .style("visibility", "hidden")

        d3.select("#instruction3")
            .style("visibility", "hidden")

        d3.select("#instruction4")
            .style("visibility", "hidden")
        
        d3.select("#instruction5")
            .style("visibility", "hidden")

        d3.select("#toggleinstructions").attr('checked', null)

    }

    // tool_tip.on("click", () => {
    //     console.log(mouseover_disable)
    //     mouseover_disable = false
    //     console.log(mouseover_disable)
    // })


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
        .attr("x", b.t)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .style("fill", "black")
        .text(function(d) { return d.data.name.substring(0,11); });

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

        d3.select("#instruction1")
            .text("1. Search for and select up to 5 tags (Use the '>' to add and '<' to remove).")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction2")
            .text("2. Click Find Movies!")
            .style("color", "yellow")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction3")
            .text("3. Hover over tag arcs to get recommendations. Tags in the inner circles")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction4")
            .text("will be weighed more heavily than those in the outer circles.")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction5")
            .text("4. Click the tag arc to get more info about the movie.")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")
                     


        }
    };

    $("#transfer1").transfer(settings);

});

function send_tags_to_server() {

    // d3.select("#toggleinstructions").attr('checked', null)
    // d3.select("#instruction1").style("visibility", "hidden")
    // d3.select("#instruction2").style("visibility", "hidden")
    // d3.select("#instruction3").style("visibility", "hidden")

    // Remove previous chart elements, Build an updated one
    d3.select("#container").selectAll("*").remove()
    d3.select("#sequence").selectAll("*").remove()
    d3.select("#legend").selectAll("*").remove()
    d3.select("#tagchart").selectAll("*").remove()

    console.log("Processing Similarity Metric...")
    var target = document.getElementById('chart');
    var spinner = new Spinner(opts).spin(target)

    d3.select("#chart").append("text").attr("class", "loading")
        .text("Running Recommendation Engine...")
        .style("color", "white")
        .style("position", "absolute")
        .style("right", "400px")
        .style("top", "300px")

    var t = d3.timer(function(elapsed) {
        if (elapsed > 30000) {
            d3.select("#chart")
            .select("text")
            .text("Taking longer than usual...")
            .style("color", "white")
            .style("position", "absolute")
            .style("right", "440px")
            .style("top", "300px")
            t.stop()
        }
    });

    // TODO: clean this code up DRY
        if (chosen_tags.length == 1) {
            document.getElementById("poster_in_circle").style.width = "360px";
            document.getElementById("poster_in_circle").style.height = "360px";
            document.getElementById("poster_in_circle").style.top =  "68px";
            document.getElementById("poster_in_circle").style.left = "68px";
        }
        else if (chosen_tags.length == 2) {
            document.getElementById("poster_in_circle").style.width = "290px";
            document.getElementById("poster_in_circle").style.height = "290px";
            document.getElementById("poster_in_circle").style.top = "105px";
            document.getElementById("poster_in_circle").style.left = "105px";
        }
        else if (chosen_tags.length == 3) {
            document.getElementById("poster_in_circle").style.width = "250px";
            document.getElementById("poster_in_circle").style.height = "250px";
            document.getElementById("poster_in_circle").style.top = "125px";
            document.getElementById("poster_in_circle").style.left = "125px";
        }
        else if (chosen_tags.length == 4) {
            document.getElementById("poster_in_circle").style.width = "220px";
            document.getElementById("poster_in_circle").style.height = "220px";
            document.getElementById("poster_in_circle").style.top = "140px";
            document.getElementById("poster_in_circle").style.left = "140px";
        }
        else if (chosen_tags.length == 5) {
            document.getElementById("poster_in_circle").style.width = "200px";
            document.getElementById("poster_in_circle").style.height = "200px";
            document.getElementById("poster_in_circle").style.top = "150px";
            document.getElementById("poster_in_circle").style.left = "150px";
        }


    $.ajax({
        type: "POST",
        url: "/tagselection",
        contentType: "application/json",
        data: JSON.stringify(chosen_tags),
        dataType: "json",
        success: function(response) {
            console.log('done.')
            csv = 0;
            tag_barchart_scores = []
            Oids = []
            barcounts = 0;
            colors = {}
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
            movie_metadata = sunburst_data.metadata
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
                colors[d.tag] = color_scale[i]
                // console.log(colors[d.tag])
            })

            // console.log(largest_paths)
            d3.select("#chart").select("text").remove()

            spinner.stop();
            json = buildHierarchy(largest_paths);
            create_SunBurst(json);
            d3.select("#movie_title").text("Hover over the tag arcs!").style("visibility", "");

        d3.select("#instruction1")
            .text("1. Search for and select up to 5 tags (Use the '>' to add and '<' to remove).")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction2")
            .text("2. Click Find Movies!")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction3")
            .text("3. Hover over tag arcs to get recommendations. Tags in the inner circles")
            .style("color", "yellow")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction4")
            .text("will be weighed more heavily than those in the outer circles.")
            .style("color", "yellow")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")

        d3.select("#instruction5")
            .text("4. Click the tag arc to get more info about the movie.")
            .style("color", "white")
            .style("text-shadow", "2px 2px black")
            .style("font-weight", "bold")



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
            barcounts = Oids.length

            create_tag_barchart()

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
                .attr("x", function(d) {
                    if (barcounts ==1) {
                        return x.bandwidth()/2.8
                      }
                      else { return x(d.tag) }
                    })
                .attr("y", function(d) { return y(d.score); })
                .attr("width", function(d) {
                    if (barcounts ==1) {
                      return (x.bandwidth()/2)
                    }
                    else { return x.bandwidth() }
                  })
                .attr("height", function(d) { return height - y(d.score); })
                .attr("fill", function(d) {return colors[d.tag]});


            g.selectAll(".label")
                .data(data).enter()
                .append("text")
                .attr("class", "label")
                .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
                .attr("y", function (d) { return y(d.score) - 20; })
                .attr("dy", ".75em")
                .text(function (d) {
                    var reco_score = d.score * 100
                    reco_score = Math.round(reco_score)
                    return reco_score + "%"});


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
    barcounts = Oids.length

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
      .attr("x", function(d) {
        if (barcounts ==1) {
            return x.bandwidth()/2.8
          }
          else { return x(d.tag) }
        })
      .attr("y", function(d) { return y(d.score); })
      .attr("width", function(d) {
        if (barcounts ==1) {
          return (x.bandwidth()/2)
        }
        else { return x.bandwidth() }
      })
      .attr("height", function(d) { return height - y(d.score); })
      .attr("fill", function(d) {return colors[d.tag]});

    bar_labels.enter().append("text")
        .attr("class", "label")
        .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
        .attr("y", function (d) { return y(d.score) - 20; })
        .attr("dy", ".75em")
        .text(function (d) {
            var reco_score = d.score * 100
            reco_score = Math.round(reco_score)
            return reco_score + "%"});

    //update to new positions
    bars.transition().duration(1000)
      .attr("class", "bar")
      .attr("x", function(d) {
        if (barcounts ==1) {
            return x.bandwidth()/2.8
          }
          else { return x(d.tag) }
        })
      .attr("y", function(d) { return y(d.score); })
      .attr("width", function(d) {
        if (barcounts ==1) {
          return (x.bandwidth()/2)
        }
        else { return x.bandwidth() }
      })
      .attr("height", function(d) { return height - y(d.score); })
      .attr("fill", function(d) {return colors[d.tag]});

    bar_labels.transition().duration(1000)
      .attr("class", "label")
      .attr("x", function (d) { return x(d.tag) + x.bandwidth()/2 - 10; })
      .attr("y", function (d) { return y(d.score) - 20; })
      .attr("dy", ".75em")
      .text(function (d) {
            var reco_score = d.score * 100
            reco_score = Math.round(reco_score)
            return reco_score + "%"});

    svg_tagchart.select("g").style("visibility", "")

}
