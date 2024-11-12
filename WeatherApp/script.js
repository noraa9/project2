const city_inpute_field = document.querySelector('.city-input')
const searchButton = document.querySelector('.search-button')

// Секциялар
const weather_InfoSection = document.querySelector('.weather-info')
const search_City_Section = document.querySelector('.search-city')
const not_Found_Section = document.querySelector('.not-found')

// Ауа-райы компоненттері
const country_Text = document.querySelector('.country-text')
const temp_Text = document.querySelector('.temp-text')
const condition_Text = document.querySelector('.condition-text')
const humidity_Value_Text = document.querySelector('.humidity-value-text')
const wind_Value_Text = document.querySelector('.wind-value-text')
const weather_Summary_Img = document.querySelector('.weather-summary-img')
const current_Date_Text = document.querySelector('.current-date-text')

const forecast_Items_Container = document.querySelector('.forecast-items-container')

const api_Key = '522fe8c30cc0e8c49a23628bb3b30afc'

// Қало атауларын іздеу. Бұл жақта через иконку.
function handleCityInput() {
    if (city_inpute_field.value.trim()) { // Проверяем, что поле не пустое после trim
        update_Whether_Info(city_inpute_field.value)
        city_inpute_field.value = ''
        city_inpute_field.blur()
    }
}

searchButton.addEventListener('click', handleCityInput)
// Қало атауларын іздеу. Бұл жақта через прес на ЭНТЕР. 
city_inpute_field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleCityInput()
    }
})

const weatherUnits = document.querySelector('.weather-units')
const celsiusButton = document.querySelector('.weather-units__celsius')
const fahrenheitButton = document.querySelector('.weather-units__farenheit')

async function getFetchData(endPoint, city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${api_Key}&units=${currentUnit}`
    const response = await fetch(apiURL)

    return response.json()
}

// Әр ауа-райында әр түрлі айдишка. Сондықтан openweathermap.org/weather-conditions - тан 
// ұқсас ауа-рай айдишкаларын алып, соларға қарап топтастырып икона атын алып отырдым.

function getWeatherIcon(id) {
    const weatherIcons = {
        thunderstorm: [0, 232],
        drizzle: [233, 321],
        rain: [322, 531],
        snow: [532, 622],
        atmosphere: [623, 781],
        clear: [782, 800],
        clouds: [801, Infinity]
    };

    for (const [icon, [min, max]] of Object.entries(weatherIcons)) {
        if (id >= min && id <= max) {
            return `${icon}.svg`;
        }
    }
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

let is_Weather_Loaded = false

// Ауа-райын жаңарту
async function update_Whether_Info(city) {
    const weatherData = await getFetchData('weather', city)

    if (weatherData.cod != 200) {
        show_Display_Section(not_Found_Section)
        is_Weather_Loaded = false
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
    country_Text.textContent = country
    temp_Text.textContent = convertTemp(temp, currentUnit) + (currentUnit === 'metric' ? ' °C' : ' °F')
    condition_Text.textContent = main
    humidity_Value_Text.textContent = humidity + '%'
    wind_Value_Text.textContent = speed + (currentUnit === 'metric' ? ' M/s ' : ' mph')
    weather_Summary_Img.src = `assets/weather/weather-icons/${getWeatherIcon(id)}`
    current_Date_Text.textContent = getCurrentDate()

    await update_Forecasts_Info(city)

    show_Display_Section(weather_InfoSection)
    is_Weather_Loaded = true
}

async function update_Forecasts_Info(city) {
    const forecastData = await getFetchData('forecast', city) //forecast бұл эндпойнт. Ол по стандарту 5 күнді көрсетеді. 
    const timeTaken = '12:00:00' //бұл фильтрация. Яғни әр күннің сағат 12:00 - дегі уақытын көрсетемін. 
    const todayDate = new Date().toISOString().split('T')[0]

    forecast_Items_Container.innerHTML = ''
    
    forecastData.list
    .filter(forecastWeather => forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) 
    .forEach(forecastWeather => update_Forecasts_Items(forecastWeather))
    console.log(forecastData)//Бұл жақта мен бірден бүгінгі күнді алмадым, себебі менде итак ол бар. 
}

let currentUnit = 'metric' // По стандарту цельчий де болады температура өлшем бірлігі. 

// Конвертировать етеді, температураның өлшем бірліктерін. 
function convertTemp(temp, unit) {
    return unit === 'imperial' ? Math.round((temp * 9/5) + 32) : Math.round(temp) // Испериал деген ол Фаренгейт.
}

celsiusButton.addEventListener('click', () => { // Фаренгейд => Цельсий
    if (!is_Weather_Loaded) {
        return // Флажоққа қараймыз
    }
    if (currentUnit !== 'metric') {
        currentUnit = 'metric'
        update_Whether_Info(city_inpute_field.value || country_Text.textContent)
        celsiusButton.classList.add('selected-unit')
        fahrenheitButton.classList.remove('selected-unit')
    }
})

fahrenheitButton.addEventListener('click', () => { // Цельсий => Фаренгейд 
    // Кстати, мұнда фича бар екен. Цельсийде по стандарту жел жылдамдығын метр/секундпен аламыз. Ал фаренгейдте по стандарту миль/в час.
    if (!is_Weather_Loaded) {
        return // Флажокқа қараймыз
    }
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial'
        update_Whether_Info(city_inpute_field.value || country_Text.textContent)
        fahrenheitButton.classList.add('selected-unit')
        celsiusButton.classList.remove('selected-unit')
    }
})

// Форкасттағы данныйларды жаңартамын
function update_Forecasts_Items(forecastWeather) { 
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

    const date_Result = dateTaken.toLocaleDateString('en-US', dateOption)

    // Форкасттағы данныйларды ауыстырамын
    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${date_Result}</h5>
            <img src="assets/weather/weather-icons/${getWeatherIcon(id)}" alt="молния макуин" class="forecast-item-img">
            <h5 class="forecast-item-temp">${convertTemp(temp, currentUnit)} ${(currentUnit === 'metric') ? '°C' : '°F'}</h5>
        </div>
    `

    forecast_Items_Container.insertAdjacentHTML('beforeend', forecastItem)
}

function show_Display_Section(section) {
    [weather_InfoSection, search_City_Section, not_Found_Section]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex' // Менде алғашында олар дисплей - нан деп тұрады. Осы жақта оларды көрсетемін. 
}
