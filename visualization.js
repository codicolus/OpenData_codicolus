var canvas = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1000 600");

var gBackground = canvas.append("g");
var gLakes = canvas.append("g");
var gHauptorte = canvas.append("g").attr("class", "hauptorte");
var gRiver = canvas.append("g");
var gWeather = canvas.append("g");

// File-Paths
var kantone = "data/kantone.geojson";
var lakes = "data/swissLakes.json";
var hauptorte = "data/hauptorte.geojson";
var riverdata = "data/flussdaten.geojson";
var weatherdata = "data/weatherstation.geojson";


var projection = d3.geoMercator()
        .scale(10000)
        .translate([-940,9555]);
                
var path = d3.geo.path().projection(projection);


// Tooltip
// create a tooltip
var Tooltip = d3.select("#map")
  .append("div")
  .attr("class", "tooltip")
  .attr("position", "fixed")
  .style("opacity", 0)
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  Tooltip.style("border-color", d3.select(this).style("fill"))
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1]) + "px");
        
        // if mouse hovers over wetter, read in metadata from weather
        if (d3.select(this).attr("class") == "weather"){
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Temperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"])
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if(d3.select(this).attr("class") == "rivers") {
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Temperaturklasse: " + d.properties["temp-class"] + "<br>")
            
        } else {
            Tooltip.html("<strong>" + "Kantonshauptstadt: " + "</strong>" +d.properties.ID1.substr(5))
        }
    
   // d3.select(this).attr("cursor", "pointer");
}
var mousemove = function(d) {
    Tooltip.style("opacity", 1)
}
var mouseleave = function(d) {
  Tooltip.style("opacity", 0)
}

// Kantone        
d3.json(kantone, function(data){
    console.log(data);
                
    areas = gBackground.selectAll(".area")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "area")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.2);
    
    //console.log(areas.attr("stroke"))
        
});

// Seen        
d3.json(lakes, function(lk){
    console.log(lk);
                
    var seen = gLakes.selectAll(".lakes")
        .data(lk.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "lakes")
        .attr("fill", "skyblue")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1);
            
});

// Hauptorte
d3.json(hauptorte, function(orte){
        console.log(orte);
        
        var ortePoints = gHauptorte.selectAll(".orte")
            .data(orte.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(5))
            .attr("class", "orte")
            .style("fill", "black")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
    //console.log(ortePoints.style("fill"))
    
    // Checkbox
    d3.select("#places").on("change", function(d){
        checked =  d3.select("#places").property("checked");
        if (checked) {
            ortePoints.attr("display", "block")
            
        } else {
            ortePoints.attr("display", "none")
        }
    })    
});

// Flussdaten
d3.json(riverdata, function(rivertemps){
        console.log(rivertemps);        
        
        var riverPoints = gRiver.selectAll(".rivers")
            .data(rivertemps.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(5))
            .attr("class", "rivers")
            .style("fill", "blue")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
        // Checkbox
        d3.select("#river").on("change", function(d){
            checked =  d3.select("#river").property("checked");
            if (checked) {
                riverPoints.attr("display", "block")

            } else {
                riverPoints.attr("display", "none")
            }
        })
    
    console.log(rivertemps.features[1].geometry.coordinates[1])
        
});

// Wetterstationen
d3.json(weatherdata, function(weather){
        console.log(weather);
        
        var weatherPoints = gWeather.selectAll(".weather")
            .data(weather.features)
            .enter()
            .append("path")
            .attr("d", path.pointRadius(5))
            .attr("class", "weather")
            .style("fill", "red")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
        // Checkbox
        d3.select("#meteo").on("change", function(d){
            checked =  d3.select("#meteo").property("checked");
            if (checked) {
                weatherPoints.attr("display", "block")

            } else {
                weatherPoints.attr("display", "none")
            }
        })
        
});


// Funktionen für Interaktionen

function mouseClickEvent() {
    var color = d3.select(this).attr("stroke");
    //console.log(color);
    
    d3.select(this).style("fill", color);
}

function mouseLeaveEvent() {
    d3.select(this).style("fill", "white");
}

