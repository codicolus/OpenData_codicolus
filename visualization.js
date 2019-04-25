/* ---------------------- Settings ------------------------ */
// Set up canvas and Layer-Groups
var canvas = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1000 600");

var gIndex = canvas.append("g");
var gKantone = canvas.append("g");
var gLakes = canvas.append("g");
var gIndex2 = canvas.append("g");
var gHauptorte = canvas.append("g").attr("class", "hauptorte");
var gRiver = canvas.append("g");
var gWeather = canvas.append("g");

// File-Paths
var kantone = "data/kantone_lines.geojson";
var lakes = "data/swissLakes.json";
var hauptorte = "data/hauptorte.geojson";
var riverdata = "data/flussdaten.geojson";
var weatherdata = "data/weatherstation.geojson";
var badewetterIndex = "data/badeindex_vect32.geojson"

// Temperatur-Index Threshold
var threshold = 35


// Define Projection and Path
var projection = d3.geoMercator()
        .scale(10000)
        .translate([-940,9555]);
                
var path = d3.geo.path().projection(projection);

/* ------------------------- Functionalities --------------- */
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
  Tooltip.style("border-color", d3.select(this).attr("stroke"))
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1]) + "px");
    
        var featureClass = d3.select(this).attr("class");
        
        // if mouse hovers over wetter, read in metadata from weather
        if ( featureClass == "weather"){
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Lufttemperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"])
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if(featureClass == "rivers") {
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Temperaturklasse: " + d.properties["temp-class"] + "<br>")
            
        } else if(featureClass == "orte") {
            Tooltip.html("<strong>" + "Kantonshauptort: " + "</strong>" + d.properties.ID1.substr(5))
        } else {
            var yesNo;
            if(d.properties.DN > threshold){
                yesNo = "JA! " + "<br>" + "&#x2714;" + "&#x1F601;" + "&#x1F44D;" ;
            }else{
                yesNo = "NEIN! " + "<br>" + "&#x274C;" + "&#x1F612;" + "&#x1F44E;";
            }
            Tooltip.html("<strong>Badeindex: </strong>" + d.properties.DN +"<br>" + "Badewetter: " + yesNo)
        }
    
    // Fill-Interaction
    if(featureClass != "bw_index2"){
        var color = d3.select(this).attr("stroke");
        //console.log(color);
        d3.select(this).style("fill", color);
    }
    
}
var mousemove = function(d) {
    Tooltip.style("opacity", 1)
}
var mouseleave = function(d) {
    //Tooltip function
    Tooltip.style("opacity", 0)
    
    // Fill-Interaction
    d3.select(this).style("fill", "white");
}

// Slider für unterschiedliche Genauigkeit
function updateRender(filepath, value){
    /*
    
    
    NOCH ZU IMPLEMENTIEREN!
    
    
    */
}

d3.select("input#accuracy").on("change", function(d){
    var accuracy = this.value;
    // Update label
    document.getElementById("lbaccur").innerHTML = "Wert: " + accuracy;
    
    var filepath;
    
    if(accuracy == 2){
        filepath = "data/badeindex_vect32.geojson";
    } else if(accuracy == 4){
        filepath = "data/badeindex_vect44.geojson";
    } else {
        filepath = "data/badeindex_vect55.geojson";
    }
    
    updateRender(filepath, accuracy);
})

// Slider für Temperatureingabe
function updateIndexThreshold(temperatur){
    index = Math.ceil(0.4 * temperatur + 22);
    threshold = index;
}

d3.select("input#parameter").on("change", function(d){
    var temperatur = this.value;
    //Update label
    document.getElementById("lbparam").innerHTML = "Wert: " + temperatur;
    
    updateIndexThreshold(temperatur);
})

/* ---------------------- Layer Initialization --------------- */
// Badewetter-Index (displayed)
d3.json(badewetterIndex, function(bw){
    console.log(bw);
                
    var bw_index1 = gIndex.selectAll(".bw_index1")
        .data(bw.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "bw_index1")
        //.style("stroke", "none")
        //.attr("border-width", "0px")
        .attr("fill", function(d,i){
            var DN = bw.features[i].properties.DN;
            var DN2 = 1-(DN/100)
            return d3.interpolateRdYlBu(DN2);
        })
});

// Kantone        
d3.json(kantone, function(data){
    console.log(data);
                
    areas = gKantone.selectAll(".area")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "area")
        .attr("fill", "white")
        .attr("fill-opacity", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 0.3);
    
    //console.log(areas.attr("stroke"))
        
});

// Badewetter-Index (hovering)
d3.json(badewetterIndex, function(bw2){
    console.log(bw2);
                
    var bw_index2 = gIndex2.selectAll(".bw_index2")
        .data(bw2.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "bw_index2")
        .attr("fill-opacity", 0)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
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
            .style("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
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
            .style("fill", "white")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
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
            .style("fill", "white")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
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