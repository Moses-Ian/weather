//variables
//==================================
var weatherKey = "d328b40d39c16723c7e965ef48afe542";
var cityNameEl = document.querySelector("#city-name");
var tempEl = document.querySelector("#temp");
var windEl = document.querySelector("#wind");
var humidityEl = document.querySelector("#humidity");
var uvEl = document.querySelector("#uv");
var forecastEl = document.querySelector(".forecast");
var formEl = document.querySelector("form");
var inputEl = document.querySelector("#city");
var historyEl = document.querySelector(".history");

var historyList = [];



//functions
//====================================
function searchCity(cityName) {
	if(cityName === cityNameEl.textContent)
		return;

	forecastEl.innerHTML = "";	//no event handlers, so this is ok
	
	getWeather(cityName);
	getForecast(cityName);
	addToHistory(cityName);
}

function getWeather(cityName) {
	var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${weatherKey}`;
	fetch(apiUrl)
	.then(function(response) {
		if(!response.ok) {
			console.log("response bad");
			return;
		}
		response.json()
		.then(function(data) {
			// console.log(data);
			displayWeather(data);
		});
	});
}

function displayWeather(data) {
	cityNameEl.textContent = data.name;
	// console.log(data);
	tempEl.textContent = data.main.temp;
	windEl.textContent = data.wind.speed;
	humidityEl.textContent = data.main.humidity;
	uvEl.textContent = "";
}

function getForecast(cityName) {
	var apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=${weatherKey}`;
	fetch(apiUrl)
	.then(function(response) {
		if(!response.ok) {
			console.log("response bad");
			return;
		}
		response.json()
		.then(function(data) {
			// console.log(data);
			// localStorage.setItem("forecast2", JSON.stringify(data));
			parseForecast(data);
		});
	});
}

function parseForecast(data) {
	//data comes in in 3 hour increments
	//search for tomorrow at noon
	var tomorrowAtNoon = moment().clone().hours(12).startOf('hour').add(1, "day");
	// console.log(tomorrowAtNoon.format("YYYY-MM-DD HH:mm:ss"));
	for(i=0; i<data.list.length; i++) {
		var timestamp = data.list[i].dt_txt;
		// console.log(timestamp);
		if(timestamp === tomorrowAtNoon.format("YYYY-MM-DD HH:mm:ss")) {
			displayForecast(data.list[i]);
			tomorrowAtNoon.add(1, "day");
		}
	}
}

function displayForecast(forecast) {
	//forecast is an object with clouds, main, etc
	var cardEl = document.createElement("ul");
	cardEl.className = "forecast-card";
	var cardDateEl = document.createElement("h2");
	cardDateEl.textContent = moment(forecast.dt_txt).format("MM/DD/YYYY");
	var cardTempEl = document.createElement("li");
	cardTempEl.textContent = `Temp: ${forecast.main.temp}`;
	var cardWindEl = document.createElement("li");
	cardWindEl.textContent = `Wind: ${forecast.wind.speed}`;
	var cardHumidityEl = document.createElement("li");
	cardHumidityEl.textContent = `Hum: ${forecast.main.humidity}`;
	
	cardEl.appendChild(cardDateEl);
	cardEl.appendChild(cardTempEl);
	cardEl.appendChild(cardWindEl);
	cardEl.appendChild(cardHumidityEl);
	
	forecastEl.appendChild(cardEl);
	
	
	
	
	
	
	
	
}

function addToHistory (cityName) {
	//brute search the list to see if cityName is already in there
	for(i=0; i<historyList.length; i++) {
		if (historyList[i] === cityName)
			return;	//the name is in there -> do nothing
	}
	
	//the name is not in there -> add it to the list
	historyList.unshift(cityName);	// add to front
	
	//and display it
	var cityHistoryEl = document.createElement("li");
	updateHistory();
}

function updateHistory() {
	historyEl.innerHTML = "";	//no event handlers, so this is ok
	
	for(i=0; i<historyList.length; i++) {
		var historyItem = document.createElement("li");
		historyItem.textContent = historyList[i];
		historyEl.appendChild(historyItem);
	}
	
}

//listeners
//=====================================
formEl.addEventListener("submit", function() {
	event.preventDefault();
	var cityName = inputEl.value.trim();
	if (!cityName)
		return;
	inputEl.setAttribute("placeholder", cityName);
	formEl.reset();
	
	searchCity(cityName);
});

historyEl.addEventListener("click", function(event) {
	var targetEl = event.target;
	if (!targetEl.matches("li"))
		return;

	searchCity(targetEl.textContent);
});








//body
//=====================================
getWeather("Phoenix");
getForecast("Phoenix");





















