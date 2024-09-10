const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const probs = document.querySelector(".blocks");
const prob2 = document.querySelector("[data-searchInput]")

const API_key = "cc1979e772139637fcfd81df620b63e5";

const GrantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".Loading-container");
const userInfoContainer = document.querySelector(".User-Info-Container");

var currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        probs.classList.remove("active");

        // Clear any previously rendered weather info
        clearWeatherInfo();

        // Handle the search form visibility
        if (!searchForm.classList.contains("active")) {
            // Switching to the search tab
            userInfoContainer.classList.remove("active");
            GrantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            searchInput.value = "";  // Clear search input field
            displayRecommendedLocations();  // Show recommended locations
        } else {
            // Switching to the user's weather tab (location-based)
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            GrantAccessContainer.classList.add("active");

            // Check for saved coordinates
            getFromSessionStorage();
        }
    }
}

// Clear any displayed weather info
function clearWeatherInfo() {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const descriptionWeather = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-WeatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-wind-speed]");
    const humidity = document.querySelector("[data-Humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = "";
    countryIcon.src = "";
    descriptionWeather.innerText = "";
    weatherIcon.src = "";
    temp.innerText = "";
    windSpeed.innerText = "";
    humidity.innerText = "";
    cloudiness.innerText = "";

    // Hide the blocks containing weather data
    document.querySelector(".blocks").style.display = "none";
}

userTab.addEventListener('click', () => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        GrantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    GrantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        console.error("Error fetching weather data:", err);
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const descriptionWeather = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-WeatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-wind-speed]");
    const humidity = document.querySelector("[data-Humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country?.toLowerCase()}.png`;
    descriptionWeather.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;

    // Show the blocks after weather info is rendered
    document.querySelector(".blocks").style.display = "flex";
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
const recommendedLocationsContainer = document.getElementById("recommended-locations");

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cityname = searchInput.value;

    if (cityname === "") {
        return;
    } else {
        fetchSearchWeatherInfo(cityname);
        // Hide the recommended locations
        recommendedLocationsContainer.innerHTML = "";  // Clear the list
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    GrantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        console.error("Error fetching weather data:", err);
        loadingScreen.classList.remove("active");
    }
}

const recommendedLocations = ["New York", "London", "Tokyo", "Goa", "Mumbai"];

function displayRecommendedLocations() {
    recommendedLocationsContainer.innerHTML = "";  // Clear previous list
    recommendedLocations.forEach(location => {
        const li = document.createElement("li");
        li.innerText = location;
        li.addEventListener("click", () => {
            fetchSearchWeatherInfo(location);  // Fetch weather on click
            recommendedLocationsContainer.innerHTML = "";  // Clear the list
        });
        recommendedLocationsContainer.appendChild(li);
    });
}

// Display the recommended locations when the user clicks on the search input
searchInput.addEventListener('focus', () => {
    displayRecommendedLocations();
    document.querySelector(".blocks").style.display = "none";

});

// Hide the recommended locations when the user clicks outside
document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
        recommendedLocationsContainer.innerHTML = "";  // Clear list
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".form-container input");
    const recommendations = document.querySelector(".recommended-locations");
    const form = document.querySelector(".form-container");
    const searchButton = document.querySelector(".form-container button");

    // Show recommendations when input is focused
    searchInput.addEventListener("focus", function () {
        recommendations.classList.add("active");
    });

    // Hide recommendations on form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        recommendations.classList.remove("active");
        const location = searchInput.value;
        console.log("Searching for: " + location);
    });

    // Hide recommendations when clicking outside the search bar or recommendations list
    document.addEventListener("click", function (event) {
        if (!form.contains(event.target) && !recommendations.contains(event.target)) {
            recommendations.classList.remove("active");
        }
    });

    // Hide recommendations when the search button is clicked
    searchButton.addEventListener("click", function () {
    recommendations.classList.remove("active");
    userInfoContainer.classList.remove("active");


        
    });

    prob2.addEventListener("click", function () {
        // recommendations.classList.remove("active");
        recommendations.classList.add("active");


        // userInfoContainer.classList.remove("active");
        console.log("click")
    document.querySelector(".blocks").style.display = "none";
    userInfoContainer.classList.remove("active");
    // document.querySelector(".User-Info-Container").style.display = "none";
    clearWeatherInfo();





        
    });
});
