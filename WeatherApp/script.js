const cityInput = document.querySelector('.city-input')
const searchButton = document.querySelector('.search-button')

// Секциялар
const weatherInfoSection = document.querySelector('.weather-info')
const searchCitySection = document.querySelector('.search-city')
const notFoundSection = document.querySelector('.not-found')

// Ауа-райы компоненттері
const countryText = document.querySelector('.country-text')
const tempText = document.querySelector('.temp-text')
const conditionText = document.querySelector('.condition-text')
const humidityValueText = document.querySelector('.humidity-value-text')
const windValueText = document.querySelector('.wind-value-text')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateText = document.querySelector('.current-date-text')

const forecastItemsContainer = document.querySelector('.forecast-items-container')

const apiKey = '522fe8c30cc0e8c49a23628bb3b30afc'

// Қало атауларын іздеу. Бұл жақта через иконку.
searchButton.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWhetherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})
// Қало атауларын іздеу. Бұл жақта через прес на ЭНТЕР. 
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWhetherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }

})

const weatherUnits = document.querySelector('.weather-units')
const celsiusButton = document.querySelector('.weather-units__celsius')
const fahrenheitButton = document.querySelector('.weather-units__farenheit')

async function getFetchData(endPoint, city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=${currentUnit}`
    const response = await fetch(apiURL)

    return response.json()
}

// Әр ауа-райында әр түрлі айдишка. Сондықтан openweathermap.org/weather-conditions - тан 
// ұқсас ауа-рай айдишкаларын алып, соларға қарап топтастырып икона атын алып отырдым.

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg'
    else if (id <= 321) return 'drizzle.svg'
    else if (id <= 531) return 'rain.svg'
    else if (id <= 622) return 'snow.svg'
    else if (id <= 781) return 'atmosphere.svg'
    else if (id <= 800) return 'clear.svg'
    else return 'clouds.svg'
}

function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB', options)
}

let isWeatherLoaded = false

// Ауа-райын жаңарту
async function updateWhetherInfo(city) {
    const weatherData = await getFetchData('weather', city)

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection)
        isWeatherLoaded = false
        return 
    }

    const {
        name: country,
        main: { temp, humidity },
        // temp - температура
        weather: [{ id, main }],
        // main - ауа-райЫ: бұлтты, күнді, т.б
        wind: { speed } 
    } = weatherData
    // Астындағы кодпен апи-дағы информациямен ауыстырып отырамын, текущий мәнді, үстіндегі объектерден
    countryText.textContent = country
    tempText.textContent = convertTemp(temp, currentUnit) + (currentUnit === 'metric' ? ' °C' : ' °F')
    conditionText.textContent = main
    humidityValueText.textContent = humidity + '%'
    windValueText.textContent = speed + (currentUnit === 'metric' ? ' M/s ' : ' mph')
    weatherSummaryImg.src = `assets/weather/weather-icons/${getWeatherIcon(id)}`
    currentDateText.textContent = getCurrentDate()

    await updateForecastsInfo(city)

    showDisplaySection(weatherInfoSection)
    isWeatherLoaded = true
}

async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city) //forecast бұл эндпойнт. Ол по стандарту 5 күнді көрсетеді. 
    const timeTaken = '12:00:00' //бұл фильтрация. Яғни әр күннің сағат 12:00 - дегі уақытын көрсетемін. 
    const todayDate = new Date().toISOString().split('T')[0]

    forecastItemsContainer.innerHTML = ''
    
    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) { //Бұл жақта мен бірден бүгінгі күнді алмадым, себебі менде итак ол бар. 
            updateForecastsItems(forecastWeather)
        }
    })
    console.log(forecastData)
}

let currentUnit = 'metric' // По стандарту цельчий де болады температура өлшем бірлігі. 

// Конвертировать етеді, температураның өлшем бірліктерін. 
function convertTemp(temp, unit) {
    return unit === 'imperial' ? Math.round((temp * 9/5) + 32) : Math.round(temp) // Испериал деген ол Фаренгейт.
}

celsiusButton.addEventListener('click', () => { // Фаренгейд => Цельсий
    if (!isWeatherLoaded) {
        return // Флажоққа қараймыз
    }
    if (currentUnit !== 'metric') {
        currentUnit = 'metric'
        updateWhetherInfo(cityInput.value || countryText.textContent)
        celsiusButton.classList.add('selected-unit')
        fahrenheitButton.classList.remove('selected-unit')
    }
})

fahrenheitButton.addEventListener('click', () => { // Цельсий => Фаренгейд 
    // Кстати, мұнда фича бар екен. Цельсийде по стандарту жел жылдамдығын метр/секундпен аламыз. Ал фаренгейдте по стандарту миль/в час.
    if (!isWeatherLoaded) {
        return // Флажокқа қараймыз
    }
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial'
        updateWhetherInfo(cityInput.value || countryText.textContent)
        fahrenheitButton.classList.add('selected-unit')
        celsiusButton.classList.remove('selected-unit')
    }
})

// Форкасттағы данныйларды жаңартамын
function updateForecastsItems(forecastWeather) { 
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp}
    } = forecastWeather

    // Бұл форматы, қалай күннің датасын шығаратынымның. Шорт - қысқа, бір сөзбен.
    const dateTaken = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    // Форкасттағы данныйларды ауыстырамын
    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="assets/weather/weather-icons/${getWeatherIcon(id)}" alt="молния макуин" class="forecast-item-img">
            <h5 class="forecast-item-temp">${convertTemp(temp, currentUnit)} ${(currentUnit === 'metric') ? '°C' : '°F'}</h5>
        </div>
    `

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex' // Менде алғашында олар дисплей - нан деп тұрады. Осы жақта оларды көрсетемін. 
}
