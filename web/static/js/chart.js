function displayAll(list_countries, metric) {
    
    if (metric == 'total_deaths'){
        var metric_name = 'Deaths (total)'
    } else if (metric == 'total_cases'){
        var metric_name = 'Confirmed cases (total)'
    } else if (metric == 'people_fully_vaccinated'){
        var metric_name = 'Fully vaccinated people'
    } else if (metric == 'people_vaccinated'){
        var metric_name = 'Vaccinated People (at least one dose)'
    }

    $(".dropdown").attr("id", metric)
    $("#doc-title").text("Covid19 - " + metric_name)

    var svg = d3.select("#chart").append("svg").attr("width", document.getElementById("chart").clientWidth - 40).attr("height", 500),
        margin = {top: 20, right: 20, bottom: 110, left: 60},
        margin2 = {top: 430, right: 20, bottom: 30, left: 60},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y),
        yGrid = d3.axisLeft(y).tickFormat("").tickSize(-width);

    var parseDate = d3.timeParse("%Y-%m-%d");

    // Sélecteur
    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    // Ajout du zoom
    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // Ligne du graphique
    var line = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(+d[metric]); });

    // Ligne du sélecteur
    var line2 = d3.line()
        .x(function (d) { return x2(d.date); })
        .y(function (d) { return y2(+d[metric]); });
    
    // Use for zooming and brushing -> avoid line to be plot outside the box 
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0); 

    var Line_chart = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


    var color = d3.scaleOrdinal(d3.schemeCategory10);  // palette de couleur

    d3.csv("/data/covid-data.csv").then(function(data) {
        // Filtre
        data = data.filter(function(d){ return list_countries.includes(d.location) })
        data.forEach(function(d) {
            d.date = parseDate(d.date);
          });

        x.domain(d3.extent(data, d => d.date));
        y.domain(d3.extent(data, d => +d[metric]));
        x2.domain(x.domain());
        y2.domain(y.domain());

        // X axe
        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    

        // Y axe
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);
    
        // Y grid
        focus.append("g")
            .attr("class", "grid grid--y")
            .call(yGrid);

        var countries = d3.group(data, d => d.location)
        countries.forEach(function(d, index) {
            Line_chart.append("path")
            .datum(d)
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", color(index));

            context.append("path")
            .datum(d)
            .attr("class", "line")
            .attr("d", line2)
            .style("stroke", color(index));
        });
    
        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);
        
        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());
        
        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);


        var mouseG = svg.append("g")
            .attr("class", "mouse-over-effects")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        mouseG.append("path") // this is the black vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var lines = document.getElementsByClassName('line');

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(countries)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

        mousePerLine.append("circle")
            .attr("r", 3)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "0");
    
        mousePerLine.append("text")
            .attr("transform", "translate(10,3)");

        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width) // can't catch mouse events on a g element
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
                d3.select(".mouse-line")
                .style("opacity", "0");
                d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
                d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
            })
            .on('mouseover', function() { // on mouse in show line, circles and text
                d3.select(".mouse-line")
                .style("opacity", "1");
                d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
                d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
            })
            .on('mousemove', function(event) { // mouse moving over canvas
                var mouse = d3.pointer(event);
                d3.select(".mouse-line")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });
    
                d3.selectAll(".mouse-per-line")
                    .attr("transform", function(d, i) {
                        var xDate = x.invert(mouse[0]),
                            bisect = d3.bisector(function(d) { return d.date; }).right;
                            idx = bisect(d.values, xDate),
                            country = d[0];
                        
                        var beginning = 0,
                            end = lines[i].getTotalLength(),
                            target = null;
            
                        while (true){
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0])      end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                        }
                        
                        d3.select(this).select('text')
                        .text(country + ": " +y.invert(pos.y).toFixed(0));
                        
                        return "translate(" + mouse[0] + "," + pos.y +")";
                    });
            });
    });

    let zoombrush;

    function brushed(event) {
        if (zoombrush) return;
        zoombrush = 1;
        var s = event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        Line_chart.selectAll(".line").attr("d", line);
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
        zoombrush = 0;
    }
    
    function zoomed(event) {
        if (zoombrush) return;
        zoombrush = 1;
        var t = event.transform;
        x.domain(t.rescaleX(x2).domain());
        Line_chart.selectAll(".line").attr("d", line);
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        zoombrush = 0;
    }

}

function update(metric) {
    var selected = [];
    $('#countries input:checked').each(function() {
        selected.push($(this).attr('value'));
    });

    // Limit display to 5 curves
    if (selected.length >= 5) {
        $("input:checkbox:not(:checked)").prop( "disabled", true );
    } else {
        $("input:checkbox:not(:checked)").prop( "disabled", false );
    }

    $(".list-group-item:has(input:checked)").prependTo("#countries")
    $("svg").remove()
    displayAll(selected, metric)
}

window.onload = function() {
    const countries = ["France", "Germany", "Russia"]
    $('#countries input').each(function() {
        console.log($(this).val())
        if (countries.includes($(this).val()))
            $(this).prop( "checked", true );
    });
    update('total_cases')
}





