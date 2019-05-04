/* ---------------------- Settings ------------------------ */
// Set up canvas and Layer-Groups
var canvas = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1000 620");

var gIndex = canvas.append("g");
var gKantone = canvas.append("g");
var gLakes = canvas.append("g");
var gIndex2 = canvas.append("g");
var gHauptorte = canvas.append("g");
var gRiver = canvas.append("g");
var gWeather = canvas.append("g");

// Point-Settings
var radius = 4;
var strkwdt = 2;

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
  //.attr("display", "none")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  Tooltip.style("border-color", d3.select(this).attr("stroke"))
        //.attr("display", "inline")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 40) + "px")
        
      /*.style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1]) + "px");*/
    
        var featureClass = d3.select(this).attr("class");
        
        // if mouse hovers over wetter, read in metadata from weather
        if ( featureClass == "weather"){
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Lufttemperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"])
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if(featureClass == "rivers") {
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Temperaturklasse: " + d.properties["temp-class"] + "<br>")
            
        } else if(featureClass == "orte") {
            Tooltip.html("<strong>" + d.properties.ID1.substr(5) + "</strong>" + " (Kanton " + d.properties.ID4 + ")")
        } else {
            var yesNo;
            if(d.properties.DN > threshold){
                yesNo = "Ja! " + "<br>" + "&#x2714;" + "&#x1F601;" + "&#x1F44D;" ;
            }else{
                yesNo = "Nein! " + "<br>" + "&#x274C;" + "&#x1F612;" + "&#x1F44E;";
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
    
    if(d3.select(this).attr("class") != "bw_index2"){
        // Fill-Interaction
        d3.select(this).style("fill", "white");
    }
    
}

// Slider für unterschiedliche Genauigkeit
function updateRender(filepath, className){
    //Update Displayed-Index File + Hovered Index File
    d3.json(filepath, function(newData){
        var newFeatures = newData.features;
        
        //console.log(className);
        
        if (className == ".bw_index1"){
            
            // enter
            gIndex.selectAll(className)
                .data(newFeatures)
                .enter().append("path")
                .attr("class", className.substr(1))
            
            // update
            gIndex.selectAll(className)
                .data(newFeatures)
                .transition()
                .duration(1000)
                .attr("d", path)
                .attr("class", className.substr(1))
                .attr("fill", function(d,i){
                    var DN = newFeatures[i].properties.DN;
                    var DN2 = 1-(DN/100)
                    return d3.interpolateRdYlBu(DN2);
                })
            
            // remove exit-selection
            gIndex.selectAll(className)
                .data(newFeatures)
                .exit()
                .remove();
            
            //console.log(gIndex.selectAll(className));
                
        }else{
            
            // enter
            gIndex.selectAll(className)
                .data(newFeatures)
                .enter().append("path")
                .attr("class", className.substr(1))
                .attr("fill-opacity", 0)
            
            // update
            gIndex.selectAll(className)
                .data(newFeatures)
                .transition()
                .duration(1000)
                .attr("d", path)
                .attr("class", className.substr(1))
            
            // remove exit-selection
            gIndex.selectAll(className)
                .data(newFeatures)
                .exit()
                .remove();
            
            //console.log(gIndex2.selectAll(className));
            
            
        }
        
    })
}

// Event-Listener Slider für Genauigkeit
d3.select("input#accuracy").on("change", function(d){
    var accuracy = this.value;
    // Update label
    document.getElementById("lbaccur").innerHTML = "Wert: " + accuracy;

    var classesToUpdate = [".bw_index1", ".bw_index2"]
    var filepath;

    if(accuracy == 1){
        filepath = "data/badeindex_vect32.geojson";
    } else if(accuracy == 2){
        filepath = "data/badeindex_vect44.json";
    } else {
        filepath = "data/badeindex_vect55.geojson";
    }
    
    // Call Update Function
    updateRender(filepath, classesToUpdate[0]);
    updateRender(filepath, classesToUpdate[1])
})


// Slider für Temperatureingabe
function updateIndexThreshold(temperatur){
    index = Math.ceil(0.4 * temperatur + 22);
    threshold = index;
}

// Event-Listener Slider für Temperatureingabe
d3.select("input#parameter").on("change", function(d){
    var temperatur = this.value;
    //Update label
    document.getElementById("lbparam").innerHTML = "Wert: " + temperatur + " °C";
    
    // Call Threshold-Update Function
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
            .attr("d", path.pointRadius(radius))
            .attr("class", "orte")
            .style("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", strkwdt)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
    //console.log(ortePoints.style("fill"))
    
    // Checkbox Interaction
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
            .attr("d", path.pointRadius(radius))
            .attr("class", "rivers")
            .style("fill", "white")
            .attr("stroke", "blue")
            .attr("stroke-width", strkwdt)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
        // Checkbox Interaction
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
            .attr("d", path.pointRadius(radius))
            .attr("class", "weather")
            .style("fill", "white")
            .attr("stroke", "red")
            .attr("stroke-width", strkwdt)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
        // Checkbox Interaction
        d3.select("#meteo").on("change", function(d){
            checked =  d3.select("#meteo").property("checked");
            if (checked) {
                weatherPoints.attr("display", "block")

            } else {
                weatherPoints.attr("display", "none")
            }
        })
        
});