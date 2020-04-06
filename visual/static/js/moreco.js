chosen_tags = []

// console.log(window.location.pathname)

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
            //console.dir(items)
            chosen_tags = items
        }
    };

    $("#transfer1").transfer(settings);
    
});

function search_movie() {
    console.log(chosen_tags)
}
