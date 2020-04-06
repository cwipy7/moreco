chosen_tags = []

// console.log(window.location.pathname)

var margin = {top: 50, right: 100, bottom: 20, left: 100}
    , width = (window.innerWidth - margin.left - margin.right) / 2
    , height = (window.innerHeight - margin.top - margin.bottom) / 2;

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

    var svg_barchart = d3.select("#barchart")
        .append("svg")
        .attr("width", 700)
        .attr("height", 400)
        .append("g")
        .attr('class', 'barchart')
        // .style("visibility", "hidden");
    
    var x_bar = d3.scaleLinear()
        .range([0, width])
        .domain([0, 1]);
    
    var y_bar = d3.scaleBand()
        .range([height, 0], .1)
        .domain([0, 1]);

    var yAxis_bar = d3.axisLeft(y_bar)
        .tickSize(0)
    
    var xAxis_bar = d3.axisBottom()
        .scale(x_bar)

    svg_barchart.append("g")
        .attr("class", "y_axis")
        .call(yAxis_bar)

    svg_barchart.append("g")
        .attr("class", "x_axis")
        .call(xAxis_bar)

    var bars_bar = svg_barchart.selectAll(".bar")
        .data([])
        .enter()
        .append("g")

    bars_bar.append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return y_bar(d.key);
        })
        .attr("height", y_bar.bandwidth())
        .attr("x", 0)
        .attr("width", function (d) {
            return x_bar(d.value);
        })
        .style("fill", "blue");
            
    bars_bar.append("text")
        .attr("x", width/2)
        .attr("y", height/2-200)
        .style("text-anchor", "middle")
        .attr("dy", ".35em")
    
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

function display_top_movies_barchart(top_movies) {
    console.log("Displaying: " + top_movies)
}