// АПИ
const mealEl_container = document.querySelector('.meal')
const fav_meals_container = document.querySelector('.fav-meals')

const search_input = document.querySelector('.search-input')
const search_icon = document.querySelector('.search-icon')

const popup_container = document.querySelector('.pop-up-container')
const close_popup_button = document.querySelector('.pop-up > i')
const popup = document.querySelector('.pop-up-inner')

const lightDarkModeSpan = document.querySelector('.light-dark-mode') 
const lightDarkModeIcon = document.querySelector('.light-dark-mode > i') 

getRandomMeal()
async function getRandomMeal() {
    const apiKey = '494b0a3397f240509a60c930a33d63a6';  // APJ кілт
    // 230107013 - 530c8c2eb3ab4502ae157c865bebb246
    // 7052c71018fa4fbcb50c1cfa8cff9805
    // 494b0a3397f240509a60c930a33d63a6
    const url = `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=1`;  // Кез-келген тамақты фетчить ету
    
    const resp = await fetch(url);
    const respData = await resp.json();
    const randomMeal = respData.recipes[0];  // Кез келген бірінші тамақты алу

    addMeal(randomMeal)
    
    console.log(randomMeal);
}


async function getMealById(id) {
    const apiKey = '494b0a3397f240509a60c930a33d63a6'; // Не забудьте API ключ
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`;  // Кез-келген тамақты фетчить ету
    
    const resp = await fetch(url);
    const meal = await resp.json(); // Получаем сам объект рецепта
    
    return meal; // Возвращаем сам объект рецепта
}

fetchFavMeals()

async function getMealsBySearch(term) {
    const apiKey = '494b0a3397f240509a60c930a33d63a6';
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${term}&apiKey=${apiKey}`;
    
    const resp = await fetch(url);
    const searchData = await resp.json();
    const mealResults = searchData.results; //осылай қалдырсам, массив менде упрощенный массивпен кетеді екен.
    // Яғни ол жақта менде құры айди, тайтл, суреті ғана бар екен. 
    //----------------------------------------------------------------------------------
    // Array(10)
    // id:715415
    // image: "https://img.spoonacular.com/recipes/715415-312x231.jpg"
    // imageType : "jpg"
    // title : "Red Lentil Soup with Chicken and Turnips"
    // [[Prototype]] : Object
    // ----------------------------------------------------------------------------------
    // Мысалы осылай, яғни тамақ туралы толық ақпарат ала алмай қалады екенмін.


    const fullMeals = []; // Сондықтан тамақтың барлық ақпаратын сақтайтын массив аштым.

    for (const meal of mealResults) {
        // Получаем полные данные о каждом блюде по ID
        const fullMealData = await getMealById(meal.id); // Айди арқылы тамақтың толық ақпаратын алдым.
        fullMeals.push(fullMealData); //Тамақтардың  Толық Ақпараттын Массивке Сақтап,
    }
    
    return fullMeals; // Сол Массивті Қайтарамын.
}



// Мұнда кез келген тамақ данныйын мил кардқа саламын. Осы жақтан главная страницада тамқатың суретімен аты шығады. Әр сайтты обновить еткен сайын, жаңа тамақты аламыз...
function addMeal(recipes) {
    const meal_card = document.createElement('div') // дивка ашамын
    meal_card.classList.add('meal-card') // листқа мил кард қосамын
    meal_card.innerHTML = ` 
        <div class="meal-card-img-container">
                <img src="${recipes.image}" alt="тамаққой кароче">
            </div>
        <div class="meal-name">
                <p>${recipes.title}</p>
                <i class="fa-regular fa-heart"></i>
        </div>
    `//осы блокты жазамын

    // Бұл жақта лүпілді басса сол тамақтың айдиы листке қосылады. Жүректін басылған, басылмағанын жүректін қалпынан түсінемін.
    const button = meal_card.querySelector('.fa-heart')
    button.addEventListener('click', () => {
        // Яғни жүректі баспай тұрып регулар болса ол солидқа ауысады, және сол тамақтың айдиы листке қосылады. 
        if (button.classList.contains('fa-regular')) {
            button.setAttribute('class', 'fa-solid fa-heart')
            addMealLS(recipes.id)
        }
        else { // else if (button.classList.contains('fa-solid))
            // Ал солидте болса, басқаннан кейін регуларға ауысып, сол айдишка листтен өшіріледі.
            button.setAttribute('class', 'fa-regular fa-heart')
            removeMealLS(recipes.id)
        }
        fetchFavMeals()
    })

    meal_card.firstChild.nextSibling.addEventListener('click', () => {
        showMealPopUp(recipes)
    })

    mealEl_container.appendChild(meal_card)//жазған блогымды контейнерге саламын, солайша ол главный экранда шығады
}

function addMealLS(mealID) { //тамақтын айдиын локал стораджге сақтайды. 
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealID]))
}

function removeMealLS(mealID) { 
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealID)))
}

function getMealLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))
    return mealIds === null ? [] : mealIds
}

// Енді листтің ішінен тамақтарды фетчить етемін
async function fetchFavMeals() {
    fav_meals_container.innerHTML = ''
    const mealsId = getMealLS()
    const meals = []
    for(let i = 0; i < mealsId.length; i++) {
        const mealID = mealsId[i]
        recipes = await getMealById(mealID)
        addMealToFav(recipes)
        meals.push(recipes)
    }

}

//  Экранға енді оларды көрсетеміз
function addMealToFav(meal) {
    const fav_meals = document.createElement('div')
    fav_meals.innerHTML = `
            <div class="single">
                <div class="top">
                    <div class="img-container">
                        <img src="${meal.image}">
                    </div>
                    <div class="text">
                        <p>${meal.title}</p>
                    </div>
                </div>
                <i class="fa-solid fa-x"></i>
            </div>
    `
    const x = fav_meals.querySelector('.fa-x')
    x.addEventListener('click', () => {
        removeMealLS(meal.id)

        const  heart_buttons = document.querySelectorAll('.fa-heart')
        heart_buttons.forEach(heart_btn => {
            heart_btn.setAttribute('class', 'fa-regular fa-heart')
        })

        fetchFavMeals()
    })

    fav_meals.firstChild.nextSibling.firstChild.nextSibling.addEventListener('click', () => {
        showMealPopUp(meal)
    })

    fav_meals_container.appendChild(fav_meals)
}

// Сэкчинг арқылы тамақтарды іздеу
search_icon.addEventListener('click', async () => {
    mealEl_container.innerHTML = ''; // Очищаем контейнер для новых результатов поиска
    const searchVal = search_input.value.trim(); // Получаем значение из поля поиска и убираем пробелы
    console.log(searchVal)
    const meals = await getMealsBySearch(searchVal); // Получаем результаты поиска
    if (searchVal === ''){
        getRandomMeal()
    }
    else {
        // Проверяем, были ли найдены блюда
        if (meals && meals.length > 0) {
            meals.forEach(meal => {
                addMeal(meal); // Добавляем каждое найденное блюдо
            });
            document.querySelector('.meals-container > h2').innerText = 'Search Result(s)...'; // Обновляем заголовок
        } else {
            // Если не найдено, выводим сообщение
            document.querySelector('.meals-container > h2').innerText = 'No Meal(s) Found...'; 
        }
    }
});

search_input.addEventListener('keydown', async (event) => {
    if (event.key == 'Enter' && search_input.value.trim() != '') {
        mealEl_container.innerHTML = ''; // Очищаем контейнер для новых результатов поиска
        const searchVal = search_input.value.trim(); // Получаем значение из поля поиска и убираем пробелы
        console.log(searchVal)
        const meals = await getMealsBySearch(searchVal); // Получаем результаты поиска

    // Проверяем, были ли найдены блюда
    if (meals && meals.length > 0) {
        meals.forEach(meal => {
            addMeal(meal); // Добавляем каждое найденное блюдо
        });
        document.querySelector('.meals-container > h2').innerText = 'Search Result(s)...'; // Обновляем заголовок
    } else {
        // Если не найдено, выводим сообщение
        document.querySelector('.meals-container > h2').innerText = 'No Meal(s) Found...'; 
    }
    }
})


close_popup_button.addEventListener('click', () => {
    popup_container.style.display = 'none'
})

function showMealPopUp(recipes) {
    if (recipes || recipes.extendedIngredients) {
        console.log(recipes);
    }


    popup.innerHTML = ''

    const newPopup = document.createElement('div');
    newPopup.classList.add('pop-up-inner');

    const ingredients = []; // Массив для хранения ингредиентов
    for (let i = 0; i < recipes.extendedIngredients.length; i++) {
        const ingredient = recipes.extendedIngredients[i];
        // Добавляем название ингредиента и его количество в массив
        ingredients.push(`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`);
    }

    newPopup.innerHTML = `
        <div class="left">
            <div class="meal">
                <div class="meal-card">
                    <div class="meal-card-img-container">
                        <img src="${recipes.image}" alt="">
                    </div>
                    <div class="meal-name">
                        <p>${recipes.title}</p>
                        <i class="fa-regular fa-heart"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="right">
            <div>
                <h2>Instructions</h2>
                <p class="meal-info">
                    ${recipes.instructions}
                </p>
            </div>
            <div>
                <h2>Ingredients / Measures</h2>
                <ul>
                    ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    popup.appendChild(newPopup);
    popup_container.style.display = 'flex';
}

lightDarkModeSpan.addEventListener('click', () => { // light mode <=> dark mode
    if (lightDarkModeIcon.classList.contains('fa-moon')) {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-sun')
    }
    else {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-moon')
    }

    document.documentElement.classList.toggle('light-theme')
})
function searchRecipes(query) {
    const apiKey = '494b0a3397f240509a60c930a33d63a6'; // API key
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            // Clear the container before adding new results
            mealEl_container.innerHTML = ''; 
            const meals = data.results; // Array of meals
            meals.forEach(meal => addMeal(meal)); // Call addMeal for each meal
        })
        .catch(error => console.error('Error fetching search results:', error));
}

// Event listener for input changes
search_input.addEventListener('input', (e) => {
    const query = e.target.value.trim();  // Get trimmed input query
    if (query) {
        searchRecipes(query);
     }
});
