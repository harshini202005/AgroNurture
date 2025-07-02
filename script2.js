document.getElementById('soil-health-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get input values
    const cropType = document.getElementById('crop-type').value;
    const soilType = document.getElementById('soil-type').value;
    const phValue = parseFloat(document.getElementById('ph-value').value);
    const nitrogen = parseFloat(document.getElementById('nitrogen').value);
    const phosphorus = parseFloat(document.getElementById('phosphorus').value);
    const potassium = parseFloat(document.getElementById('potassium').value);

    // Calculate soil health score (basic example)
    const score = (phValue * 0.5) + (nitrogen * 0.3) + (phosphorus * 0.2) + (potassium * 0.2);

    // Determine soil health level
    let healthLevel;
    if (score >= 20) {
        healthLevel = "Excellent";
    } else if (score >= 15) {
        healthLevel = "Good";
    } else if (score >= 10) {
        healthLevel = "Average";
    } else {
        healthLevel = "Poor";
    }

    // Display result
    document.getElementById('result').innerHTML = `
        <h3>Soil Health Level: ${healthLevel}</h3>
        <p>Score: ${score.toFixed(2)}</p>
        <p>Crop Type: ${cropType}</p>
        <p>Soil Type: ${soilType}</p>
    `;
});
// Your web app's Firebase configuration
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

document.getElementById("soil-health-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const cropType = document.getElementById("crop-type").value;
    const soilType = document.getElementById("soil-type").value;
    const phValue = parseFloat(document.getElementById("ph-value").value);
    const nitrogen = parseInt(document.getElementById("nitrogen").value);
    const phosphorus = parseInt(document.getElementById("phosphorus").value);
    const potassium = parseInt(document.getElementById("potassium").value);

    // Push data to Firebase Realtime Database
    database.ref('soilHealthData').push({
        crop_type: cropType,
        soil_type: soilType,
        ph_value: phValue,
        nitrogen: nitrogen,
        phosphorus: phosphorus,
        potassium: potassium
    })
    .then(() => {
        alert("Soil health data saved successfully!");
        document.getElementById("soil-health-form").reset(); // Reset form after submission
    })
    .catch(error => {
        console.error("Error saving data:", error);
    });
});


