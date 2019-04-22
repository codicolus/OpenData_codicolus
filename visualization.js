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
var riverdata = "data/flusstemperaturen_converted.geojson";
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


// Funktionen für Interaktionen

function mouseClickEvent(d) {
    var color = d3.select(this).attr("stroke");
    //console.log(color);
    
    d3.select(this).style("fill", color);
}

function mouseLeaveEvent(d) {
    d3.select(this).style("fill", "white");
}