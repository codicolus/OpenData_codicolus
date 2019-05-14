/* ---------------------- Settings ------------------------ */
// Set up canvas and Layer-Groups
var canvas = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1000 650");

// Layer grouping
var gIndex11 = canvas.append("g")
    .attr("id", "res11");
var gIndex12 = canvas.append("g")
    .attr("id", "res12")
    .attr("display", "none");
var gIndex13 = canvas.append("g")
    .attr("id", "res13")
    .attr("display", "none");
var gKantone = canvas.append("g");
var gLakes = canvas.append("g");
var gIndex21 = canvas.append("g")
    .attr("id", "res21");
var gIndex22 = canvas.append("g")
    .attr("id", "res22")
    .attr("display", "none");
var gIndex23 = canvas.append("g")
    .attr("id", "res23")
    .attr("display", "none");
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
var index_res1 = "data/badeindex_vect32.json";
var index_res2 = "data/badeindex_vect44.json";
var index_res3 = "data/badeindex_vect55.json";

// Temperatur-Index Threshold
var threshold = 30

// Define Projection and Path
var projection = d3.geoMercator()
        .scale(10000)
        .translate([-940,9555]);
                
var path = d3.geo.path().projection(projection);

/* ------------------------- Functionalities --------------- */
// Converts temperature class in temperature-range
var convertTempClass = function(tclass) {
    if(tclass == 1){
        return "<6 °C";
    }
    if(tclass == 2){
        return "6-9 °C";
    }
    if(tclass == 3){
        return "9-12 °C";
    }
    if(tclass == 4){
        return "12-15 °C";
    }
    if(tclass == 5){
        return "15-18 °C";
    }
    if(tclass == 6){
        return "18-21 °C";
    }
    if(tclass == 7){
        return "21-24 °C";
    }
    if(tclass == 8){
        return ">24 °C";
    }
    
    return "nicht verfügbar"
}


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
            numstring = d.properties.Time.toString();
            
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Lufttemperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"] + "<br>" + "" + "<br>" +
                        numstring.substring(6,8) + "." + numstring.substring(4,6) +
                        "." + numstring.substring(0,4) +
                        " " + numstring.substring(8,10) + ":" +
                        numstring.substring(10,12))
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if(featureClass == "rivers") {
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Temperaturklasse: " + convertTempClass(d.properties["temp-class"]) + "<br>")
            
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
    if(featureClass != ("index21" || "index22" || "index23")){
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
    
    if(d3.select(this).attr("class") != ("index21" || "index22" || "index23")){
        // Fill-Interaction
        d3.select(this).style("fill", "white");
    }
    
}

// Aktivieren einer spezifischen Genauigkeit (Ersatz für update Function)
function accuracyChange(res){
    if (res == 1){
        gIndex11.attr("display", "block");
        gIndex12.attr("display", "none");
        gIndex21.attr("display", "block");
        gIndex22.attr("display", "none");
        gIndex13.attr("display", "none");
        gIndex23.attr("display", "none");
    }
    if (res == 2){
        gIndex11.attr("display", "none");
        gIndex12.attr("display", "block");
        gIndex21.attr("display", "none");
        gIndex22.attr("display", "block");
        gIndex13.attr("display", "none");
        gIndex23.attr("display", "none");
    }
    if (res == 3){
        gIndex11.attr("display", "none");
        gIndex12.attr("display", "none");
        gIndex21.attr("display", "none");
        gIndex22.attr("display", "none");
        gIndex13.attr("display", "block");
        gIndex23.attr("display", "block");
    }
}

// Event-Listener Slider für Genauigkeit
d3.select("input#accuracy").on("change", function(d){
    var accuracy = this.value;
    // Update label
    document.getElementById("lbaccur").innerHTML = "Wert: " + accuracy;

    // Update Layers
    accuracyChange(accuracy);
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
// Badewetter-Index (displayed) Accuracy 1
d3.json(index_res1, function(bw){
    console.log(bw);
    
    var in_vals = topojson.feature(bw, bw.objects.badeindex_vect32).features;
                
    var bw_index1 = gIndex11.selectAll(".index11")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index11")
        //.style("stroke", "none")
        //.attr("border-width", "0px")
        .attr("fill", function(d,i){
            var DN = in_vals[i].properties.DN;
            var DN2 = 1-(DN/100)
            return d3.interpolateRdYlBu(DN2);
        })
});

// Badewetter-Index (displayed) Accuracy 2
d3.json(index_res2, function(bw){
    console.log(bw);
    
    var in_vals = topojson.feature(bw, bw.objects.badeindex_vect44).features;
                
    var bw_index1 = gIndex12.selectAll(".index12")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index12")
        //.style("stroke", "none")
        //.attr("border-width", "0px")
        .attr("fill", function(d,i){
            var DN = in_vals[i].properties.DN;
            var DN2 = 1-(DN/100)
            return d3.interpolateRdYlBu(DN2);
        })
});

// Badewetter-Index (displayed) Accuracy 3
d3.json(index_res3, function(bw){
    console.log(bw);
    
    var in_vals = topojson.feature(bw, bw.objects.badeindex_vect55).features;
                
    var bw_index1 = gIndex13.selectAll(".index13")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index13")
        //.style("stroke", "none")
        //.attr("border-width", "0px")
        .attr("fill", function(d,i){
            var DN = in_vals[i].properties.DN;
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

// Badewetter-Index (hovering) Accuracy 1
d3.json(index_res1, function(bw2){
    //console.log(bw2);
    
    var in_vals = topojson.feature(bw2, bw2.objects.badeindex_vect32).features;
                
    var bw_index2 = gIndex21.selectAll(".index21")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index21")
        .attr("fill-opacity", 0)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
});

// Badewetter-Index (hovering) Accuracy 2
d3.json(index_res2, function(bw2){
    //console.log(bw2);
    
    var in_vals = topojson.feature(bw2, bw2.objects.badeindex_vect44).features;
                
    var bw_index2 = gIndex22.selectAll(".index21")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index21")
        .attr("fill-opacity", 0)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
});

// Badewetter-Index (hovering) Accuracy 3
d3.json(index_res3, function(bw2){
    //console.log(bw2);
    
    var in_vals = topojson.feature(bw2, bw2.objects.badeindex_vect55).features;
                
    var bw_index2 = gIndex23.selectAll(".index23")
        .data(in_vals)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "index23")
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
    
    //console.log(rivertemps.features[1].geometry.coordinates[1])
        
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

// --------------------------------------
// Colorscale and Legend Creation
var legend = canvas.append("g")
                .attr("class", "legendSequential")
                .attr("transform", "translate(190,580)");

// Gradient-Scale
var lingrad = legend.append("linearGradient")
                .attr("id", "grad1")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");
lingrad.append("stop")
    .attr("offset", "0%")
    .style("stop-color", d3.interpolateYlOrRd(0))
    .style("stop-opacity", 1);
lingrad.append("stop")
    .attr("offset", "50%")
    .style("stop-color", d3.interpolateYlOrRd(0.5))
    .style("stop-opacity", 1);
lingrad.append("stop")
    .attr("offset", "100%")
    .style("stop-color", d3.interpolateYlOrRd(1))
    .style("stop-opacity", 1);

var bbox = legend.node().getBoundingClientRect();
var width = bbox.width;
var height = bbox.height;

// Colorbar
legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 550)
    .attr("height", 20)
    .attr("fill", "url(#grad1)")
    .attr("stroke", "white");
// Ticks
legend.append("text")
    .attr("x", -1)
    .attr("y", 27)
    .style("font-family", "Open Sans")
    .style("font-size", "10px")
    .style("fill", "white")
    .text("I")
legend.append("text")
    .attr("x", 275)
    .attr("y", 27)
    .style("font-family", "Open Sans")
    .style("font-size", "10px")
    .style("fill", "white")
    .text("I")
legend.append("text")
    .attr("x", 548.5)
    .attr("y", 27)
    .style("font-family", "Open Sans")
    .style("font-size", "10px")
    .style("fill", "white")
    .text("I")

// Quantities
legend.append("text")
    .attr("x", -3)
    .attr("y", 40)
    .style("font-family", "Open Sans")
    .style("font-size", "12px")
    .style("fill", "white")
    .text("0")
legend.append("text")
    .attr("x", 269.5)
    .attr("y", 40)
    .style("font-family", "Open Sans")
    .style("font-size", "12px")
    .style("fill", "white")
    .text("50")
legend.append("text")
    .attr("x", 539.5)
    .attr("y", 40)
    .style("font-family", "Open Sans")
    .style("font-size", "12px")
    .style("fill", "white")
    .text("100")

//Title
legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-family", "Open Sans")
    .style("font-size", "15px")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text("Index-Skala")


// Punkte-Legende
var pointLegend = canvas.append("g")
                    .attr("class", "pointLegend")
                    .attr("transform", "translate(750, 500)")
                    .attr("color", "lightgrey");

//Title
pointLegend.append("text")
    .attr("x", 5)
    .attr("y", -20)
    .style("font-family", "Open Sans")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .text("Punktdaten")


// Circles + Legend-Text
pointLegend.append("circle")
    .attr("cx", 10)
    .attr("cy", 0)
    .attr("r", 6)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 2)


pointLegend.append("circle")
    .attr("cx", 10)
    .attr("cy", 20)
    .attr("r", 6)
    .attr("fill", "white")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)

pointLegend.append("circle")
    .attr("cx", 10)
    .attr("cy", 40)
    .attr("r", 6)
    .attr("fill", "white")
    .attr("stroke", "red")
    .attr("stroke-width", 2)

pointLegend.append("text")
    .attr("x", 25)
    .attr("y", 5)
    .style("font-family", "Open Sans")
    .style("font-size", "15px")
    .style("fill", "black")
    .text("Kantonshauptorte")
pointLegend.append("text")
    .attr("x", 25)
    .attr("y", 25)
    .style("font-family", "Open Sans")
    .style("font-size", "15px")
    .style("fill", "blue")
    .text("Flussmessstationen")
pointLegend.append("text")
    .attr("x", 25)
    .attr("y", 45)
    .style("font-family", "Open Sans")
    .style("font-size", "15px")
    .style("fill", "red")
    .text("Wetterstationen")