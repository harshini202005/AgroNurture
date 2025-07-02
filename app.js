let soilData = null;
let weatherData = null;

// Initialize map
var map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Automatically detect user location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;

        // Set view and add user marker
        map.setView([userLat, userLng], 13);
        L.marker([userLat, userLng]).addTo(map)
            .bindPopup("<b>Your Current Location</b><br />Use this location for analysis.")
            .openPopup();

        // Fetch and store weather data
        fetchWeatherData(userLat, userLng);
    }, function() {
        alert('Geolocation failed or permission denied.');
    });
} else {
    alert('Geolocation is not supported by this browser.');
}

// Fetch weather data from OpenWeatherMap
function fetchWeatherData(lat, lon) {
    const apiKey = '19c395fc79e7b17aa21d5d2cafa63c23'; // Replace with your API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const clouds = data.clouds.all;
            const rainfall = data.rain ? (data.rain['1h'] || 0) : 0;

            weatherData = {
                temp: temperature,
                humidity: humidity,
                clouds: clouds,
                rainfall: rainfall
            };

            document.getElementById('temp').innerHTML = "Temperature: " + temperature + "°C";
            document.getElementById('hum').innerHTML = "Humidity: " + humidity + "%";
            document.getElementById('cloud').innerHTML = "Clouds: " + clouds + "%";
            document.getElementById('rain').innerHTML = "Rainfall: " + rainfall + " mm last hour";
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBMargidiUiWaW8lWsV9BgQ6Uo3CmlTqpE",
    authDomain: "farmer-8151a.firebaseapp.com",
    databaseURL: "https://farmer-8151a-default-rtdb.firebaseio.com",
    projectId: "farmer-8151a",
    storageBucket: "farmer-8151a.appspot.com",
    messagingSenderId: "632585424979",
    appId: "1:632585424979:web:777b3fd9481fb10a69b6a6",
    measurementId: "G-6CX0DCMDBJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Fetch latest soil health data
function fetchLatestSoilHealthData() {
    database.ref('soilHealthData').limitToLast(1).once('value')
        .then(snapshot => {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                soilData = {
                    ph: parseFloat(data.ph_value || 0),
                    nitrogen: parseFloat(data.nitrogen || 0),
                    phosphorus: parseFloat(data.phosphorus || 0),
                    potassium: parseFloat(data.potassium || 0)
                };

                // Fill form fields if needed
                document.getElementById('soil-type').value = data.soil_type || '';
                document.getElementById('ph-value').value = soilData.ph;
                document.getElementById('nitrogen').value = soilData.nitrogen;
                document.getElementById('phosphorus').value = soilData.phosphorus;
                document.getElementById('potassium').value = soilData.potassium;
            });
        })
        .catch(error => {
            console.error('Error fetching soil data:', error);
        });
}
fetchLatestSoilHealthData();

// Drawing tools
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        marker: false,
        rectangle: true
    }
});
map.addControl(drawControl);

// Calculate and display area
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    var areaHectares = (area / 10000).toFixed(2);
    document.getElementById('farm-size').innerHTML = "Farm size: " + areaHectares + " hectares";
});

// Analyze Button Event
document.getElementById('analyze-btn').addEventListener('click', function () {
    if (!soilData || !weatherData) {
        alert("❗ Please wait until soil and weather data is loaded.");
        return;
    }

    alert('✅ Analyzing soil and weather data...');
    const recommendation = recommendFertilizer(soilData, weatherData);
    alert(recommendation);

    let recDiv = document.getElementById('fertilizer-recommendation');
    if (!recDiv) {
        recDiv = document.createElement("div");
        recDiv.id = "fertilizer-recommendation";
        recDiv.style.marginTop = "15px";
        recDiv.style.padding = "10px";
        recDiv.style.border = "1px solid #ccc";
        recDiv.style.borderRadius = "8px";
        document.body.appendChild(recDiv);
    }

    recDiv.innerHTML = `<b>🧪 Fertilizer Recommendation:</b><br>${recommendation}`;
});
function recommendFertilizer(soilData, weatherData) {
  const { nitrogen, phosphorus, potassium, ph, soil_type } = soilData;
  const { temp, rainfall } = weatherData;

  let fertilizer = "";
  let advice = "";

  if (ph < 6.0) {
    fertilizer = "Lime + Balanced NPK fertilizer";
    advice = "Soil is acidic (pH < 6), lime will help raise pH and balanced NPK will improve nutrients.";
  } else if (ph > 7.8) {
    fertilizer = "Sulfur + Balanced NPK fertilizer";
    advice = "Soil is alkaline (pH > 7.8), sulfur lowers pH and balanced NPK supports nutrient needs.";
  } else {
    if (soil_type === 'Red') {
      if (nitrogen < 10) {
        fertilizer = "NPK 20-20-20 + Organic Matter";
        advice = "Red soil low in nitrogen; apply balanced NPK with organic matter.";
      } else {
        fertilizer = "Balanced NPK fertilizer";
        advice = "Red soil with adequate nitrogen; balanced NPK recommended.";
      }
    } else if (soil_type === 'Black') {
      if (phosphorus < 10 || potassium < 15) {
        fertilizer = "Urea + SSP + MOP";
        advice = "Black soil low in phosphorus or potassium; apply these fertilizers.";
      } else {
        fertilizer = "Balanced NPK fertilizer";
        advice = "Black soil nutrients adequate; balanced NPK recommended.";
      }
    } else {
      fertilizer = "Balanced NPK fertilizer";
      advice = "Soil type unknown or optimal; use balanced NPK fertilizer.";
    }
  }

  if (rainfall < 10) {
    advice += " Apply fertilizer in split doses due to dry conditions.";
  } else if (rainfall > 20 && temp > 30) {
    advice += " Use slow-release fertilizer to reduce nutrient loss in heavy rain and heat.";
  }

  return `Fertilizer Recommendation: ${fertilizer}\nAdvice: ${advice}`;
}

// Usage example - call this inside your analyze button event handler
document.getElementById('analyze-btn').addEventListener('click', function () {
  if (!soilData || !weatherData) {
    alert("❗ Please wait until soil and weather data is loaded.");
    return;
  }

  // Make sure soilData includes a soil type before calling:
  if (!soilData.soil_type) {
    soilData.soil_type = 'Red';  // Or get this from your input/select form
  }

  const recommendation = recommendFertilizer(soilData, weatherData);

  // Display recommendation on page
  let recDiv = document.getElementById('fertilizer-recommendation');
  if (!recDiv) {
    recDiv = document.createElement("div");
    recDiv.id = "fertilizer-recommendation";
    recDiv.style.marginTop = "15px";
    recDiv.style.padding = "10px";
    recDiv.style.border = "1px solid #ccc";
    recDiv.style.borderRadius = "8px";
    document.body.appendChild(recDiv);
  }
  recDiv.innerHTML = `<b>🧪 Fertilizer Recommendation:</b><br><pre>${recommendation}</pre>`;
});
