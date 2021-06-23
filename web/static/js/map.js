// Inspired by: https://www.datavis.fr/index.php?page=map-improve

function draw(metric){
    const width = 1800;
    const height = 800;
    const legendCellSize = 20;
    const toremove = ["Europe", "Asia", "North America", "Africa", "Oceania", "World", "South America", "European Union", "International"];

    if (metric == 'total_deaths'){
        var colors = ['#ffb3b3', '#ff9999', '#ff8080', '#ff6666', '#ff4d4d', '#ff3333', '#ff1a1a', '#ff0000', '#e60000', '#cc0000', '#b30000', '#990000', '#800000', '#660000', '#4d0000', '#330000'];
        var metric_name = 'Deaths (total)';
        var metric_percent = '% of deaths (total)';
    } else if (metric == 'total_cases'){
        var colors = ['#fff0b3', '#ffeb99', '#ffe680', '#ffe066', '#ffdb4d', '#ffd633', '#ffd11a', '#ffcc00', '#e6b800', '#cca300', '#b38f00', '#997a00', '#806600', '#665200', '#4d3d00', '#332900'];
        var metric_name = 'Confirmed cases (total)';
        var metric_percent = '% of confirmed cases (total)';
    } else if (metric == 'people_fully_vaccinated'){
        var colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];
        var metric_name = 'Fully vaccinated people';
        var metric_percent = '% of fully vaccinated people';
    } else if (metric == 'people_vaccinated'){
        var colors = ['#b3d1ff', '#99c2ff', '#80b3ff', '#66a3ff', '#4d94ff', '#3385ff', '#1a75ff', '#0066ff', '#005ce6', '#0052cc', '#0047b3', '#003d99', '#003380', '#002966', '#001f4d', '#001433'];
        var metric_name = 'Vaccinated people (at least one dose)'
        var metric_percent = '% of vaccinated people (at least one dose)';
    }
    var datetime = '2021-06-21'

    d3.select('svg').remove();
    const svg = d3.select('#map').append("svg")
        .attr("id", "svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");

    let title = svg.append('text')
        .attr('class', 'title')
        .attr('y', 24)
        .html(`${metric_percent}`);

    const projection = d3.geoNaturalEarth1()
        .scale(1)
        .translate([0, 0]);

    const path = d3.geoPath()
        .pointRadius(2)
        .projection(projection);

    const cGroup = svg.append("g");

    var promises = [];
    promises.push(d3.json("/data/countries.json"));
    promises.push(d3.csv("/data/covid-data.csv").then(
                                                    function(data) {
                                                        data.forEach(function(d) {
                                                        d.code = d.iso_code;
                                                        d.population = +d.population;
                                                        d.score = +d[metric];
                                                        d.country = d.location;
                                                        });
                                                        return data;
                                                    }
                                                )
                                                .then(
                                                    function(data) {
                                                        data = data.filter(function(d) {
                                                            return d.date == datetime && toremove.indexOf(d.country) < 0;
                                                        })
                                                        return data
                                                    }
                                                )
    );

    Promise.all(promises).then(function(values) {
        const geojson = values[0];
        const scores = values[1];

        var b  = path.bounds(geojson),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);
        
        cGroup.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", d => "code" + d.id)
            .attr("class", "country")
            .style("fill", "#c0c0c0");
        
        const min = d3.min(scores, d =>  (+d.score / +d.population) * 100),
            max = d3.min([d3.max(scores, d =>  (+d.score / +d.population) * 100), 100]);
        var quantile = d3.scaleQuantile().domain([min, max])
            .range(colors);
                
        var legend = addLegend(min, max);
        var tooltip = addTooltip();
            
        scores.forEach(function(e,i) {
            var countryPath = d3.select("#code" + e.code);
            countryPath
                .attr("scorecolor", quantile((+e.score / +e.population) * 100))
                .style("fill", quantile((+e.score / +e.population) * 100))
                .on("mouseover", function(d) {
                    d3.selectAll(".country")
                        .style("opacity", .5)
                    d3.select(this)
                        .style("opacity", 1)
                        .style("stroke", "black")
                    tooltip.style("display", null);
                    tooltip.select('#tooltip-country')
                        .text(shortCountryName(e.country));
                    tooltip.select('#tooltip-population')
                        .text(d3.format(",")(e.population));
                    tooltip.select('#tooltip-score')
                        .text(d3.format(",")(e.score));
                    legend.select("#cursor")
                        .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (getColorIndex(quantile((+e.score / +e.population) * 100)) * legendCellSize) + ')')
                        .style("display", null);
                })
                .on("mouseout", function(d) {
                    d3.selectAll(".country")
                        .style("opacity", 1)
                        .style("stroke", "transparent")
                    d3.select(this)
                        .style("stroke", "transparent")
                    tooltip.style("display", "none");
                    legend.select("#cursor").style("display", "none");
                })
                .on("mousemove", function(d) {
                    var mouse = d3.mouse(this);
                    if (e.country == 'New Zealand' || e.country == 'New Caledonia' || e.country == 'Papua New Guinea' || e.country == 'Fiji' || e.country == 'Vanuatu' ||  e.country == 'Solomon Islands'){
                        tooltip.attr("transform", "translate(" + (mouse[0] - 220) + "," + (mouse[1] - 90) + ")");
                    } else {
                        tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 90) + ")");
                    }
                });
        });
    });

    function addLegend(min, max) {
        var legend = svg.append('g')
            .attr('transform', 'translate(80, 50)');
            
        legend.selectAll()
            .data(d3.range(colors.length))
            .enter().append('svg:rect')
                .attr('height', legendCellSize + 'px')
                .attr('width', legendCellSize + 'px')
                .attr('x', 5)
                .attr('y', d => d * legendCellSize)
                .attr('class', 'legend-cell')
                .style("fill", d => colors[d])
                .on("mouseover", function(d) {
                    legend.select("#cursor")
                        .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (d * legendCellSize) + ')')
                        .style("display", null);
                    d3.selectAll(".country")
                        .style("opacity", .5)
                    d3.selectAll("path[scorecolor='" + colors[d] + "']")
                        .style("opacity", 1)
                        .style("stroke", "black")
                })
                .on("mouseout", function(d) {
                    legend.select("#cursor")
                        .style("display", "none");
                    d3.selectAll("path[scorecolor='" + colors[d] + "']")
                        .style('fill', colors[d]);
                    d3.selectAll(".country")
                        .style("opacity", 1)
                        .style("stroke", "transparent")
                    d3.select(this)
                        .style("stroke", "transparent")
                });
            
        legend.append('svg:rect')
            .attr('y', legendCellSize + colors.length * legendCellSize)
            .attr('height', legendCellSize + 'px')
            .attr('width', legendCellSize + 'px')
            .attr('x', 5)
            .style("fill", "#c0c0c0");
            
        legend.append("text")
            .attr("x", 30)
            .attr("y", 35 + colors.length * legendCellSize)
            .style("font-size", "13px")
            .style("color", "#929292")
            .style("fill", "#929292")
            .text("No data");
        
        legend.append("polyline")
            .attr("points", legendCellSize + ",0 " + legendCellSize + "," + legendCellSize + " " + (legendCellSize * 0.2) + "," + (legendCellSize / 2))
            .attr("id", "cursor")
            .style("display", "none")
            .style('fill', "black");
                
        var legendScale = d3.scaleLinear().domain([min, max])
            .range([0, colors.length * legendCellSize]);
        
        legendAxis = legend.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(legendScale));
        
        return legend;
    }

    function addTooltip() {
        var tooltip = svg.append("g")
            .attr("id", "tooltip")
            .style("display", "none");
        
        tooltip.append("polyline")
            .attr("points","0,0 220,0 220,80 0,80 0,0")
            .style("fill", "#222b1d")
            .style("stroke","black")
            .style("opacity","0.9")
            .style("stroke-width","1")
            .style("padding", "1em");
        
        tooltip.append("line")
            .attr("x1", 40)
            .attr("y1", 25)
            .attr("x2", 160)
            .attr("y2", 25)
            .style("stroke","#929292")
            .style("stroke-width","0.5")
            .attr("transform", "translate(0, 5)");
        
        var text = tooltip.append("text")
            .style("font-size", "13px")
            .style("fill", "#c1d3b8")
            .attr("transform", "translate(0, 20)");
        
        text.append("tspan")
            .attr("x", 110)
            .attr("y", 0)
            .attr("id", "tooltip-country")
            .attr("text-anchor", "middle")
            .style("font-weight", "600")
            .style("font-size", "16px");

        text.append("tspan")
            .attr("x", 110)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("fill", "#929292")
            .text("Population: ");

        text.append("tspan")
            .attr("id", "tooltip-population")
            .style("fill","#c1d3b8")
            .style("font-weight", "bold");
        
        if (metric == 'people_fully_vaccinated'){
            text.append("tspan")
                .attr("x", 110) 
                .attr("y", 50)
                .attr("text-anchor", "middle")
                .style("fill", "#929292")
                .text("Fully vaccinated: ");
        } else if (metric == 'people_vaccinated'){
            text.append("tspan")
                .attr("x", 110)
                .attr("y", 50)
                .attr("text-anchor", "middle")
                .style("fill", "#929292")
                .text("At least one dose: ");
        } else {
            text.append("tspan")
                .attr("x", 110)
                .attr("y", 50)
                .attr("text-anchor", "middle")
                .style("fill", "#929292")
                .text(`${metric_name}: `);
        }

        text.append("tspan")
            .attr("id", "tooltip-score")
            .style("fill","#c1d3b8")
            .style("font-weight", "bold");
        
        return tooltip;
    }

    function shortCountryName(country) {
        return country.replace("Democratic", "Dem.").replace("Republic", "Rep.");
    }

    function getColorIndex(color) {
        for (var i = 0; i < colors.length; i++) {
            if (colors[i] === color) {
                return i;
            }
        }
        return -1;
    }

    addSvgLegend1();
    function addSvgLegend1() {
        const width = 200,
            height = 400;

        const svgLegend1 = d3.select('#svgLegend1').append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");
        
        svgLegend1.append("circle")
            .attr("cx", 40)
            .attr("cy", 50)
            .attr("r", 3)
            .style("fill", "red");
    }

    addSvgLegend2();
    function addSvgLegend2() {
        const width = 200,
            height = 400;

        const svgLegend2 = d3.select('#svgLegend2').append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");
        
        svgLegend2.append("circle")
            .attr("cx", 40)
            .attr("cy", 50)
            .attr("r", 3)
            .style("fill", "red");
        
        var legend = svgLegend2.append('g')
            .attr('transform', 'translate(40, 50)');
        
        legend.selectAll()
            .data(d3.range(colors.length))
            .enter().append('svg:rect')
                .attr('y', d => d * legendCellSize)
                .attr('height', legendCellSize + 'px')
                .attr('width', legendCellSize + 'px')
                .attr('x', 5)
                .style("fill", d => colors[d]);
    }

    addSvgLegend3();
    function addSvgLegend3() {
        const width = 200,
            height = 400;

        const svgLegend3 = d3.select('#svgLegend3').append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");
        
        svgLegend3.append("circle")
            .attr("cx", 40)
            .attr("cy", 50)
            .attr("r", 3)
            .style("fill", "red");
        
        var legend = svgLegend3.append('g')
            .attr('transform', 'translate(40, 50)');
        
        legend.selectAll()
            .data(d3.range(colors.length))
            .enter().append('svg:rect')
                .attr('y', d => d * legendCellSize)
                .attr('height', legendCellSize + 'px')
                .attr('width', legendCellSize + 'px')
                .attr('x', 5)
                .style("fill", d => colors[d]);
                
        var legendScale = d3.scaleLinear().domain([44, 97])
            .range([0, colors.length * legendCellSize]);
        
        legendAxis = legend.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(legendScale));
    }
}

draw('total_deaths');