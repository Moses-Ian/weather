//variables
//==================================
var weatherKey = "d328b40d39c16723c7e965ef48afe542";
var showHistoryEl = document.querySelector(".show-history");
var arrowEl = document.querySelector(".arrow");
var searchEl = document.querySelector(".search");
var cityNameEl = document.querySelector("#city-name");
var dateEl = document.querySelector("#date");
var tempEl = document.querySelector("#temp");
var iconEl = document.querySelector("#icon");
var windEl = document.querySelector("#wind");
var humidityEl = document.querySelector("#humidity");
var uvEl = document.querySelector("#uv");
var forecastEl = document.querySelector(".forecast");
var formEl = document.querySelector("form");
var inputEl = document.querySelector("#city");
var historyEl = document.querySelector(".history");

var historyList = [];
var idList = [
	[/2\d\d/, "11d"], //2xx
	[/3\d\d/, "09d"], //3xx
	[/50\d/,  "10d"], //50x
	[/511/,   "13d"], //511
	[/5\d\d/, "09d"], //5xx
	[/6\d\d/, "13d"], //6xx
	[/7\d\d/, "50d"], //7xx
	[/800/,   "01d"], //800
	[/801/,   "02d"], //801
	[/802/,   "03d"], //802
	[/803/,   "04d"], //803
	[/804/,   "04d"], //804
];
	


//functions
//====================================
function searchCity(cityName) {
	if(cityName === cityNameEl.textContent)
		return;

	
	var result = getWeather(cityName);
	if (result) {
		// if the city is valid
		getForecast(cityName);
		addToHistory(cityName);
	}
}

function getWeather(cityName) {
	var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${weatherKey}`;
	fetch(apiUrl)
	.then(function(response) {
		if(!response.ok) {
			console.log("response bad");
			return false;
		}
		response.json()
		.then(function(data) {
			// console.log(data);
			displayWeather(data);
			return true;
		});
	});
}

function displayWeather(data) {
	console.log(data);
	//the uv stuff
	getUVIndex(data.coord.lat, data.coord.lon);
	//everything else
	cityNameEl.textContent = data.name;
	dateEl.textContent = moment().format("MM/DD/YYYY");
	iconEl.setAttribute("src", getIcon(data.weather[0].id));
	iconEl.setAttribute("alt", data.weather[0].description);
	tempEl.textContent = `${data.main.temp} °F`;
	windEl.textContent = `${data.wind.speed} MPH`;
	humidityEl.textContent = `${data.main.humidity} %`;
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
			console.log(data);
			parseForecast(data);
		});
	});
}

function parseForecast(data) {
	forecastEl.innerHTML = "";	//no event handlers, so this is ok

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
	cardEl.className = "forecast-card block";
	var cardDateEl = document.createElement("h3");
	cardDateEl.textContent = moment(forecast.dt_txt).format("MM/DD");
	var cardIconEl = document.createElement("img");
	cardIconEl.setAttribute("src", getIcon(forecast.weather[0].id));
	cardIconEl.setAttribute("alt", forecast.weather[0].description);
	cardIconEl.classList = "forecast-icon";
	var cardTempEl = document.createElement("li");
	cardTempEl.textContent = `Temp: ${forecast.main.temp} °F`;
	var cardWindEl = document.createElement("li");
	cardWindEl.textContent = `Wind: ${forecast.wind.speed} MPH`;
	var cardHumidityEl = document.createElement("li");
	cardHumidityEl.textContent = `Hum: ${forecast.main.humidity} %`;
	
	cardEl.appendChild(cardDateEl);
	cardEl.appendChild(cardIconEl);
	cardEl.appendChild(cardTempEl);
	cardEl.appendChild(cardWindEl);
	cardEl.appendChild(cardHumidityEl);
	
	forecastEl.appendChild(cardEl);
}

function addToHistory (cityName) {
	//brute search the list to see if cityName is already in there
	for(i=0; i<historyList.length; i++) {
		if (historyList[i] === cityName) {
			//the name is in there -> remove it
			historyList.splice(i, 1);
			break;
		}
	}
	
	//add the name to the top of the list
	historyList.unshift(cityName);	// add to front
	//save it
	localStorage.setItem("weather-history", JSON.stringify(historyList));
	
	//and display it
	updateHistory();
}

function updateHistory() {
	historyEl.innerHTML = "";	//no event handlers, so this is ok
	
	for(i=0; i<historyList.length; i++) {
		var historyItem = document.createElement("li");
		historyItem.classList = "history-item";
		historyItem.textContent = historyList[i];
		historyEl.appendChild(historyItem);
	}
}

function getIcon(code) {
	code = code.toString();
	// console.log(code);
	
	for(var i=0; i<idList.length; i++) {
		if (code.match(idList[i][0])) {
			// console.log(idList[i][1]);
			return `./assets/images/${idList[i][1]}.png`;
		}
	}
}

function getUVIndex(lat, lon) {
	//since uv index only comes with this call, we need an additional call
	var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=imperial&appid=${weatherKey}`;
	fetch(apiUrl)
	.then(function(response) {
		if(!response.ok) {
			console.log("response bad");
			return;
		}
		response.json()
		.then(function(data) {
			console.log(data);
			displayUVIndex(data);
		});
	});
}

function displayUVIndex(data) {
	uvEl.textContent = data.current.uvi;
	if (data.current.uvi < 3) 
		uvEl.style.backgroundColor = "var(--grn)";
	else if (data.current.uvi < 6) 
		uvEl.style.backgroundColor = "var(--ylw)";
	else if (data.current.uvi < 8) 
		uvEl.style.backgroundColor = "var(--org)";
	else if (data.current.uvi < 11) 
		uvEl.style.backgroundColor = "var(--red)";
	else  
		uvEl.style.backgroundColor = "var(--pur)";
}

function peakHistory() {
	if (window.innerWidth > 768)
		return;
	if (searchEl.style.display == "none" || searchEl.style.display == "") {
		searchEl.style.display = "block";
		arrowEl.style.transform = "rotate(-225deg)";
		arrowEl.style.marginRight = "-10px";
	} else {
		searchEl.style.display = "none";
		arrowEl.style.transform = "rotate(-45deg)";
		arrowEl.style.marginRight = "10px";
	}
}

function badCity() {
	
}

//listeners
//=====================================
showHistoryEl.addEventListener("click", peakHistory);

formEl.addEventListener("submit", function() {
	event.preventDefault();
	var cityName = inputEl.value.trim();
	if (!cityName)
		return;
	inputEl.setAttribute("placeholder", cityName);
	formEl.reset();
	
	searchCity(cityName);
	peakHistory();
});

historyEl.addEventListener("click", function(event) {
	var targetEl = event.target;
	if (!targetEl.matches("li"))
		return;

	searchCity(targetEl.textContent);
	peakHistory();
});








//body
//=====================================
//load history
historyList = (JSON.parse(localStorage.getItem("weather-history")) || ["Phoenix"]);
updateHistory();

getWeather(historyList[0]);
getForecast(historyList[0]);























