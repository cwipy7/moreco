chosen_tags = []

// console.log(window.location.pathname)

var margin = {
    top: 15,
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
    height = 500 - margin.top - margin.bottom;

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
    .range([height, 0], .5)
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

svg_barchart.append("g")
    .attr("class", "x_axis")
    .call(xAxis_bar)
    .selectAll("text")
    .attr("transform", "translate(0,-20)" );

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
    


// bars_bar.append("text")
//     .attr("class", "label")
//     .attr("y", function (d) {
//         return y_bar(d.movie) + y_bar.bandwidth() / 2 + 4;
//     })
//     .attr("x", function (d) {
//         return x_bar(d.tag_relevance) + 3;
//     })
//     .text(function (d) {
//         return d.tag_relevance;
//     });


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
        }
    };

    $("#transfer1").transfer(settings);
});

function send_tags_to_server() {
    // console.log(chosen_tags)
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
        .attr("height", y_bar.bandwidth())
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
                "<a href=imdb.com/title/" + d.id + ">" + d.id + "/</a>" + "<br/>" + "Relevance: " + d.relevance_score 
                + "<br/>" + "<img src=" + image_link + ">")
                
                // "imdb.com/title/" + d.id + "<br/>"  + "Relevance: " + d.relevance_score 
                //         + "<br/>" + "<img src=" + image_link + ">")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", "blue");
            tool_tip.transition()		
                .duration(500)		
                .style("opacity", 0);
        });

    // bars_bar.select(".label")
    //     .attr("y", function (d) {
    //         return y_bar(d.movie) + y_bar.bandwidth() / 2 + 4;
    //     })
    //     .attr("x", function (d) {
    //         return x_bar(d.tag_relevance) + 3;
    //     })
    //     .text(function (d) {
    //         return d.tag_relevance;
    //     });
        

    svg_barchart.select(".y_axis").call(yAxis_bar)
    svg_barchart.style("visibility", "visible");

}