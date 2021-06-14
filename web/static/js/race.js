function draw(dataset){
    // Feel free to change or delete any of the code you see in this editor!
    if (dataset == "total_cases"){
        var chosen = "Confirmed Cases (total)"
    } else if (dataset == "total_deaths"){
        var chosen = "Deaths (total)"
    } else if (dataset == "people_fully_vaccinated"){
        var chosen = "Fully Vaccinated People"
    } else {
        var chosen = "Vaccinated People (at least one dose)"}
    
    d3.select('svg').remove();
    var svg = d3.select("body").append("svg")
      .attr("width", 1500)
      .attr("height", 600);
    
    var tickDuration = 2800;
    
    var top_n = 12;
    var height = 600;
    var width = 960;
    
    const margin = {
      top: 80,
      right: 0,
      bottom: 5,
      left: 0
    };
  
    let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);
      
    let title = svg.append('text')
     .attr('class', 'title')
     .attr('y', 24)
     .html(chosen);
  
    let subTitle = svg.append("text")
     .attr("class", "subTitle")
     .attr("y", 55)
     .html("Race will start in few seconds...");
   
    let caption = svg.append('text')
     .attr('class', 'caption')
     .attr('x', width)
     .attr('y', height-5)
     .style('text-anchor', 'end')
     .html('Source: John Hopkins Institute');


     if (dataset === "people_fully_vaccinated" || dataset === "people_vaccinated"){
          var year = 2020.9
        }

     else{
     var year = 2020.0;
    }
     


   d3.csv(`/data/chartrace_${dataset}.csv`).then(function(data) {
    //if (error) throw error;
      
      console.log(data);
      
       data.forEach(d => {
        d.value = +d.value,
        d.lastValue = +d.lastValue,
        d.year = +d.year,
        d.colour = d3.hsl(Math.random()*360,0.75,0.75)
      });

     console.log(data);
    
     let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
      .sort((a,b) => b.value - a.value)
      .slice(0, top_n);
  
      yearSlice.forEach((d,i) => d.rank = i);
    
     console.log('yearSlice: ', yearSlice)
  
     let x = d3.scaleLinear()
        .domain([0, d3.max(yearSlice, d => d.value)])
        .range([margin.left, width-margin.right-65]);
  
     let y = d3.scaleLinear()
        .domain([top_n, 0])
        .range([height-margin.bottom, margin.top]);
  
     let xAxis = d3.axisTop()
        .scale(x)
        .ticks(width > 500 ? 5:2)
        .tickSize(-(height-margin.top-margin.bottom))
        .tickFormat(d => d3.format(',')(d));
  
     svg.append('g')
       .attr('class', 'axis xAxis')
       .attr('transform', `translate(0, ${margin.top})`)
       .call(xAxis)
       .selectAll('.tick line')
       .classed('origin', d => d == 0);
  
     svg.selectAll('rect.bar')
        .data(yearSlice, d => d.name)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(0)+1)
        .attr('width', d => x(d.value)-x(0)-1)
        .attr('y', d => y(d.rank)+5)
        .attr('height', y(1)-y(0)-barPadding)
        .style('fill', d => d.colour);
      
     svg.selectAll('text.label')
        .data(yearSlice, d => d.name)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .style('text-anchor', 'end')
        .html(d => d.name);
      
    svg.selectAll('text.valueLabel')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
      .text(d => d3.format(',.0f')(d.lastValue));

    let yearText = svg.append('text')
      .attr('class', 'yearText')
      .attr('x', width-margin.right)
      .attr('y', height-25)
      .style('text-anchor', 'end')
      .html(~~year)
      .call(halo, 10);
     
   let ticker = d3.interval(e => {

      yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
        .sort((a,b) => b.value - a.value)
        .slice(0,top_n);

      yearSlice.forEach((d,i) => d.rank = i);
     
      //console.log('IntervalYear: ', yearSlice);

      x.domain([0, d3.max(yearSlice, d => d.value)]); 
     
      svg.select('.xAxis')
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .call(xAxis);
    
       let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);
    
       bars
        .enter()
        .append('rect')
        .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
        .attr('x', x(0)+1)
        .attr( 'width', d => x(d.value)-x(0)-1)
        .attr('y', d => y(top_n+1)+5)
        .attr('height', y(1)-y(0)-barPadding)
        .style('fill', d => d.colour)
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5);
          
       bars
        .attr('x', x+1)
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => x(d.value)-x(0)-1)
          .attr('y', d => y(d.rank)+5);
            
       bars
        .exit()
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => x(d.value)-x(0)-1)
          .attr('y', d => y(top_n+1)+5)
          .remove();

       let labels = svg.selectAll('.label')
          .data(yearSlice, d => d.name);
     
       labels
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
        .style('text-anchor', 'end')
        .html(d => d.name)    
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
             
    
   	   labels
          .transition()
          .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
     
       labels
          .exit()
          .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(top_n+1)+5)
            .remove();
         

     
       let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);
    
       valueLabels
          .enter()
          .append('text')
          .attr('class', 'valueLabel')
          .attr('x', d => x(d.value)+5)
          .attr('y', d => y(top_n+1)+5)
          // .text(d => d3.format(',.0f')(d.lastValue))
          .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .tween("text", function(d) {
               let i = d3.interpolateRound(d.lastValue, d.value);
               return function(t) {
                 this.textContent = d3.format(',')(i(t));
              };
            });
            
       valueLabels
          .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .tween("text", function(d) {
               let i = d3.interpolateRound(d.lastValue, d.value);
               return function(t) {
                 this.textContent = d3.format(',')(i(t));
              };
            });
      
     
      valueLabels
        .exit()
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value)+5)
          .attr('y', d => y(top_n+1)+5)
          .tween("text", function(d) {
               let i = d3.interpolateRound(d.lastValue, d.value);
               return function(t) {
                 this.textContent = d3.format(',')(i(t));
              };
            })
          .remove();
    
      // yearText.html(year);
      function testNum(a) {
        let number = Math.round((a % 1)*10)/10
        let str_year = '' + ~~year
        if (number === 0) {
          result = str_year.concat(' - ', "weeks 1 to 7");
        } else if (number === 0.1) {
          result = str_year.concat(' - ', "weeks 7 to 12");
        } else if (number === 0.2) {
          result = str_year.concat(' - ', "weeks 12 to 17");
        } else if (number === 0.3) {
          result = str_year.concat(' - ', "weeks 17 to 22");
        } else if (number === 0.4) {
          result = str_year.concat(' - ', "weeks 22 to 27");
        } else if (number === 0.5) {
          result = str_year.concat(' - ', "weeks 27 to 32");
        } else if (number === 0.6) {
          result = str_year.concat(' - ', "weeks 32 to 37");
        } else if (number === 0.7) {
          result = str_year.concat(' - ', "weeks 37 to 42");
        } else if (number === 0.8) {
          result = str_year.concat(' - ', "weeks 42 to 47");
        } else if (number === 0.9) {
          result = str_year.concat(' - ', "weeks 47 to 52");
        } else {
          result = str_year;
        }
        return result;
      }

      // let date_mois = Math.round((year % 1)*10)/10

      yearText.html(testNum(year));
     if(year == 2021.4) ticker.stop();
     year = d3.format('.1f')((+year) + 0.1);
   },tickDuration);

 });
    
 const halo = function(text, strokeWidth) {
  text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
    .style('fill', '#ffffff')
     .style( 'stroke','#ffffff')
     .style('stroke-width', strokeWidth)
     .style('stroke-linejoin', 'round')
     .style('opacity', 1);
   
}   
}

draw("total_cases");