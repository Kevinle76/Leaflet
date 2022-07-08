
// GeoJSON URL Variables:
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Initialize & Create Two Separate LayerGroups:
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Define Variables for Tile Layers:
var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

// Define baseMaps Object to Hold Base Layers:
var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": grayscalemap,
    "Outdoor": outdoorsmap
};

// Create Overlay Objects:
var overlaymaps = {
    "Earthquakes": earthquakes,
    "TectonicPlates": tectonicPlates
};

// Create Map:
var myMap = L.map("map", {
    center: [35, -92],
    zoom: 1.2,
    layers: [satellitemap, earthquakes]
});

// Create a Layer Control:
L.control.layers(baseMaps, overlaymaps).addTo(myMap);

// Retrieve earthquakesURL with D3:
d3.json(earthquakesURL, function(earthquakeData) {
// Function to Determine Size of Marker:
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3.2;
    }
// Function to Determine Style of Marker:
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
// Function to Determine Color of Marker:
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#2c7fb8";
        case magnitude > 4:
            return "#7fcdbb";
        case magnitude > 3:
            return "#edf8b1";
        case magnitude > 2:
            return "#9ecae1";
        case magnitude > 1:
            return "#deebf7";
        default:
            return "#3182bd";
        }
    }
    // Create a GeoJSON Layer
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " +  Date(feature.properties.time) + 
            "</p><hr><p>Magnitude Level: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

    // Retrieve platesURL with D3:
    d3.json(platesURL, function(plateData) {
        L.geoJson(plateData, {
            color: "#f03b20",
            weight: 2
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(myMap);
    });

    // Create a Legend:
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitlevels = [0, 1, 2, 3, 4, 5];

        div.innerHTML += "<h3>Magnitude Levels</h3>"

        for (var i = 0; i < magnitlevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitlevels[i] + 1) + '"></i> ' +
                magnitlevels[i] + (magnitlevels[i + 1] ? '&ndash;' + magnitlevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
});

