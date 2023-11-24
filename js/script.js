let body = document.querySelector('body');
let container = document.querySelector('.container');

let errorText = document.querySelector('.error');
let search = document.querySelector('.search');
let searchImg = document.querySelector('.search-img');

let weatherContainer = document.querySelector('.show-weather-container');
let imageWeather = document.querySelector('.image-weather');
let weatherDegrees = document.querySelector('.weather-degrees');
let weatherDescription = document.querySelector('.weather-description');

let dateLocation = document.querySelector('.show-date-location');
let showDay = document.querySelector('.day-of-the-week');
let showDate = document.querySelector('.date');
let showLocation = document.querySelector('.location');

let sidePanel = document.querySelector('.side-panel');
let additionalWeatherElements = document.querySelectorAll('.additional-weather__element');
let sidePanelDays = document.querySelectorAll('.day');

const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

window.addEventListener('load', ()=>{
    search.focus()

    let firstDate = new Date();
    showDay.textContent = daysArray[firstDate.getDay()];
    showDate.textContent = firstDate.toDateString().slice(4);    
});

search.addEventListener('input',()=>{
    const inputValue = search.value;
    search.value = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
});

search.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
        if(weatherContainer.style.opacity == '1'){
            weatherContainer.style.opacity = '0';
            dateLocation.style.opacity = '0';
            sidePanel.classList.toggle('to-left');
            let input = search.value;
            if(errorText.classList.contains('shake')) {
                errorText.classList.remove('shake')
            };
            sidePanel.style.zIndex = '-1';

            setTimeout(() => {
                search.value = input;
                buildWeather();
                
                setTimeout(() => {
                    weatherContainer.style.opacity = '1';
                    dateLocation.style.opacity = '1';
                }, 150);
            }, 1000);
            search.value = '';
            return;
        }
        buildWeather();
        weatherContainer.style.opacity = '1';
        dateLocation.style.opacity = '1';
    }
});

searchImg.addEventListener('click',()=>{
    if(!search.value) return
    search.focus();
    if(weatherContainer.style.opacity == '1'){
        weatherContainer.style.opacity = '0';
        dateLocation.style.opacity = '0';
        sidePanel.classList.toggle('to-left');
        let input = search.value;
        if(errorText.classList.contains('shake')) {
            errorText.classList.remove('shake')
        };
        sidePanel.style.zIndex = '-1';

        setTimeout(() => {
            search.value = input;
            buildWeather();
            
            setTimeout(() => {
                weatherContainer.style.opacity = '1';
                dateLocation.style.opacity = '1';
            }, 150);
        }, 1000);
        search.value = '';
        return;
    }
    buildWeather();
    weatherContainer.style.opacity = '1';
    dateLocation.style.opacity = '1';
});

function buildWeather(){
    fetch(`http://api.weatherapi.com/v1/forecast.json?key=9ddee5c54391405dafc195617232308&q=${search.value}&lang=en&days=5`)
        .then(response => {
            if(!response.ok){
                throw new Error('Something went wrong');
            }
            return response.json()
        })
        .then(json => {
            showWeather(json);
            showDateLocation(json);
            showAdditionalWeather(json);
        })
        .catch(error =>{
            sidePanel.classList.toggle('to-left');
            errorText.classList.add('shake');
            showWeather(error);
            showDateLocation(error);
            showAdditionalWeather(error);
            console.error(error)
        })

        search.value = '';
};

function showWeather(json){
    if(json == 'Error: Something went wrong'){
        imageWeather.innerHTML = `<img src="." alt="icon" class="weather-img">`;
        weatherDegrees.textContent = `???`;
        weatherDescription.textContent = '???';
    }
    else{
        imageWeather.innerHTML = `<img src="${json.current.condition.icon}" alt="weather" class="weather-img">`;
        weatherDegrees.textContent = `${Math.round(json.current.temp_c)}°C`;
        weatherDescription.textContent = json.current.condition.text;

        if(json.current.is_day){
            container.classList.add('day-time');
            container.classList.remove('night-time');
        }
        else{
            container.classList.remove('day-time');
            container.classList.add('night-time');
        }
    }
};

function showDateLocation(json){
    if(json == 'Error: Something went wrong'){
        showDay.textContent = 'Someday';
        showDate.textContent = 'Somedate';

        showLocation.textContent = `City, Country`
    }
    else{
        let date = new Date(json.location.localtime);
        showDay.textContent = daysArray[date.getDay()];
        showDate.textContent = date.toDateString().slice(4);

        showLocation.textContent = `${json.location.name}, ${json.location.country}`
    }
};

function showAdditionalWeather(json){
    if(json == 'Error: Something went wrong') {
        additionalWeatherElements.forEach(element =>{
            element.lastElementChild.textContent = '???';
        });
        sidePanelDays.forEach(day=>{
            day.children[0].src ='.'
            day.children[1].textContent = '???';
            day.children[2].textContent = '???';
            day.classList.remove('selected');
        });
    }
    else{
        sidePanel.classList.toggle('to-left');
        setTimeout(() => {
            sidePanel.style.zIndex = '0';
        }, 1000);
        
        for (let i = 0; i < additionalWeatherElements.length; i++) {
            const elem = additionalWeatherElements[i].firstElementChild.children[1].textContent;
            if(elem == 'HUMIDITY'){
                additionalWeatherElements[i].lastElementChild.textContent = `${json.forecast.forecastday[0].day.avghumidity}%`;
            }
            else if(elem == 'WIND'){
                additionalWeatherElements[i].lastElementChild.textContent = `${json.forecast.forecastday[0].day.maxwind_kph} km/h`;
            }
        }

        let date = new Date(json.location.localtime);
        let today = date.getDay();
        for (let i = 0; i < json.forecast.forecastday.length; i++) {
            sidePanelDays[i].classList.remove('selected');

            const element = json.forecast.forecastday[i].day;
            
            sidePanelDays[i].children[0].src = element.condition.icon;
            if(today+i > 6){
                today = 0;
            }
            sidePanelDays[i].children[1].textContent = `${daysArray[today+i].slice(0,3)}`;
            sidePanelDays[i].children[2].textContent = `${element.avgtemp_c}°C`;

            sidePanelDays[i].addEventListener('click', ()=>{
                sidePanelDays.forEach(day =>{
                    day.classList.remove('selected');
                })
                sidePanelDays[i].classList.add('selected');

                for (let j = 0; j < additionalWeatherElements.length; j++) {
                    const elem = additionalWeatherElements[j].firstElementChild.children[1].textContent;
                    if(elem == 'HUMIDITY'){
                        additionalWeatherElements[j].lastElementChild.textContent = `${json.forecast.forecastday[i].day.avghumidity}%`;
                    }
                    else if(elem == 'WIND'){
                        additionalWeatherElements[j].lastElementChild.textContent = `${json.forecast.forecastday[i].day.maxwind_kph} km/h`;
                    }
                }
            })
        }
        sidePanelDays[0].classList.add('selected');
    }
};



