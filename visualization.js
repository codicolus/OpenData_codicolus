var canvas = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1000 600");

var gBackground = canvas.append("g");
var gLakes = canvas.append("g");
var gHauptorte = canvas.append("g");
var gRiver = canvas.append("g");
var gWeather = canvas.append("g");

var projection = d3.geoMercator()
        .scale(10000)
        .translate([-940,9555]);
                
var path = d3.geo.path().projection(projection);


// Kantone
var kantone = "data/kantone.geojson";        
d3.json(kantone, function(data){
    console.log(data);
                
    var areas = gBackground.selectAll(".area")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "area")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.2);
            
});

// Seen
var lakes = "data/swissLakes.json";        
d3.json(lakes, function(lk){
    console.log(lk);
                
    var areas = gLakes.selectAll(".lakes")
        .data(lk.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "lakes")
        .attr("fill", "skyblue")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1);
            
});

// Hauptorte
var hauptorte = "data/hauptorte.geojson";
d3.json(hauptorte, function(orte){
        console.log(orte);
        
        var ortePoints = gHauptorte.selectAll(".orte")
            .data(orte.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(3))
            .attr("class", "orte")
            .style("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
        
});

// Flussdaten
var riverdata = "data/flussdaten.geojson";
d3.json(riverdata, function(rivertemps){
        console.log(rivertemps);        
        
        var riverPoints = gRiver.selectAll(".rivers")
            .data(rivertemps.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(3))
            .attr("class", "rivers")
            .style("fill", "white")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .on("mouseover", mouseClickEvent)
            .on("mouseleave", mouseLeaveEvent);
    
    console.log(rivertemps.features[1].geometry.coordinates[1])
        
});

// Wetterstationen
var weatherdata = "data/weatherstation.geojson";
d3.json(weatherdata, function(weather){
        console.log(weather);
        
        var weatherPoints = gWeather.selectAll(".weather")
            .data(weather.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(3))
            .attr("class", "weather")
            .style("fill", "white")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .on("mouseover", mouseClickEvent)
            .on("mouseleave", mouseLeaveEvent);
        
});


//
// create a tooltip
    var Tooltip = d3.select("#map")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
    
// Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      Tooltip.style("opacity", 1)
    }
    var mousemove = function(d) {
        var mousecoords = d3.mouse(d.node().parentNode);
      Tooltip
        .html(d.name + "<br>" + "long: " + d.long + "<br>" + "lat: " + d.lat)
        //.attr("transform", "translate(" + (mousecoords[0]-10) + "," + (mousecoords[1]-10) + ")");
    }
    var mouseleave = function(d) {
      Tooltip.style("opacity", 0)
    }

//

// Funktionen für Interaktionen

function mouseClickEvent() {
    var color = d3.select(this).attr("stroke");
    //console.log(color);
    
    d3.select(this).style("fill", color);
}

function mouseLeaveEvent() {
    d3.select(this).style("fill", "white");
}

// Event Listener and Functions for Checkboxes
function displayLayer(){
    //for each check box:
    d3.select("#sidebar").select(".checkbox").each(function(d){
        var cb = d3.select(this);
        var grp = cb.property("value");
        var svg = d3.select("svg");
        console.log(grp);
        
        // If checked show group otherwise hide
        if(cb.property("checked")){
            svg.selectAll("."+grp).style("display", "block")
        }else{
            svg.selectAll("."+grp).style("display", "none")
        }
    });
}

    // Event Listener when checkbox is changed
d3.select("#sidebar").selectAll(".checkbox").on("change", displayLayer);

displayLayer();


// BufferSlider
    d3.select("#BufferSlider").on("change", function(d){
        var buff = this.value
        d3.select("#section1")
        canvas.selectAll("g")
            .selectAll(".orte .rivers .weather").attr(d, path.pointRadius(buff));
        });

console.log(d3.select("#section1").selectAll("input"));
