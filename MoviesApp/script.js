const API_KEY = '261870a3b747009bee9ac11793e1c6bf';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

const movieContainer = document.querySelector('.movie');
const fav_movies_container = document.querySelector('.fav-movies');

const popup_container = document.querySelector('.pop-up-container');
const close_popup_button = document.querySelector('.pop-up > i');
const popup = document.querySelector('.pop-up-inner');

const lightDarkModeSpan = document.querySelector('.light-dark-mode');
const lightDarkModeIcon = document.querySelector('.light-dark-mode > i');
const searchInput = document.querySelector('.search-input'); // поиск по названию фильма

// Функция для получения популярных фильмов
async function getPopularMovies() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        displayMovies(data.results);
        console.log(data);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

async function getMovieById(id) {
    const url = `${BASE_URL}/movie/${id}?&append_to_response=videos&api_key=${API_KEY}`;
    
    const resp = await fetch(url);
    const movie = await resp.json();
    console.log(movie);  // Для отладки

    return movie;
}

fetchFavMovies();

// Функция для получения фильмов по поисковому запросу
async function searchMovies(query) {
    const searchURL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=en-US&page=1`;
    try {
        const response = await fetch(searchURL);
        const data = await response.json();
        currentMovies = data.results;  // Сохраняем фильмы в переменной
        displayMovies(currentMovies);  // Отображаем найденные фильмы
        console.log(data);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}
// Функция для отображения фильмов на странице
function displayMovies(movies) {
    movieContainer.innerHTML = ''; // очищаем контейнер перед отображением новых фильмов
    if (movies.length === 0) {
        document.querySelector('.movies-container > h2').innerText = 'No movies found'; // если нет фильмов, выводим сообщение
    }
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.dataset.releaseDate = movie.release_date; // add release date to the card

        movieCard.innerHTML = `
            <div class="movie-card-img-container">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="movie-name">
                <p>${movie.title}</p>
                <i class="fa-regular fa-bookmark"></i>
            </div>
        `;

        const button = movieCard.querySelector('.fa-bookmark');
        button.addEventListener('click', () => {
            if (button.classList.contains('fa-regular')) {
                button.setAttribute('class', 'fa-solid fa-bookmark');
                addMovieLS(movie.id);
            } else {
                button.setAttribute('class', 'fa-regular fa-bookmark');
                removeMovieLS(movie.id);
            }
            fetchFavMovies();
        });

        movieCard.firstChild.nextSibling.addEventListener('click', () => {
            fetch(`https://api.themoviedb.org/3/movie/${movie.id}?&append_to_response=videos&api_key=${API_KEY}`)
                .then(response => response.json())
                .then(movie => {
                    console.log(movie);  // Выводим объект фильма в консоль для проверки
                    showMoviePopUp(movie);  // Затем передаем фильм в функцию попапа
                })
                .catch(error => console.error('Error fetching movie:', error));
        });

        movieContainer.appendChild(movieCard);
    });
}


function addMovieLS(movieID) {
    const movieIds = getMovieLS();
    localStorage.setItem('movieIds', JSON.stringify([...movieIds, movieID]));
}

function removeMovieLS(movieID) {
    const movieIds = getMovieLS();
    localStorage.setItem('movieIds', JSON.stringify(movieIds.filter(id => id !== movieID)));
}

function getMovieLS() {
    const movieIds = JSON.parse(localStorage.getItem('movieIds'));
    return movieIds === null ? [] : movieIds;
}

async function fetchFavMovies() {
    fav_movies_container.innerHTML = '';
    const moviesId = getMovieLS();
    const movies = [];
    for (let i = 0; i < moviesId.length; i++) {
        const movieID = moviesId[i];
        const movie = await getMovieById(movieID);
        addMovieToFav(movie);
        movies.push(movie);
    }
}

// Открытие/закрытие панели сортировки
document.querySelector('.sort-btn').addEventListener('click', function() {
    document.querySelector('.sort-container').classList.toggle('open');
});



let sortBy = 'popularity.desc';  // Значение по умолчанию для сортировки (по популярности)
let currentMovies = [];

// Обработка изменения сортировки
document.querySelectorAll('.sort-options input').forEach(input => {
    input.addEventListener('change', function() {
        const selectedOption = this.value;
        switch (selectedOption) {
            case 'popularity':
                sortBy = 'popularity.desc';  // Сортировка по популярности
                break;
            case 'rating':
                sortBy = 'vote_average.desc';  // Сортировка по рейтингу
                break;
            case 'release_date':
                sortBy = 'primary_release_date.desc';  // Сортировка по дате выпуска
                break;
            default:
                sortBy = 'popularity.desc';  // Сортировка по умолчанию
                break;
        }

        console.log(sortBy)

        // Перезагружаем фильмы с учетом выбранной сортировки
        getMoviesSorted();
        
        // Закрыть панель сортировки после выбора
        document.querySelector('.sort-container').classList.remove('open');
    });
});

async function getMoviesSorted() {
    // Вместо запроса на сервер, сортируем уже загруженные фильмы
    let sortedMovies = [...currentMovies];  // Копируем массив текущих фильмов
    switch (sortBy) {
        case 'popularity.desc':
            sortedMovies.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'vote_average.desc':
            sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
            break;
        case 'primary_release_date.desc':
            sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            break;
        default:
            sortedMovies.sort((a, b) => b.popularity - a.popularity);
            break;
    }
    console.log(sortedMovies)
    displayMovies(sortedMovies);  // Отображаем отсортированные фильмы
}


function addMovieToFav(movie) {
    const fav_movies = document.createElement('div');
    fav_movies.innerHTML = `
        <div class="single">
            <div class="top">
                <div class="img-container">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="suret">
                </div>
                <div class="text">
                    <p>${movie.title}</p>
                </div>
            </div>
            <i class="fa-solid fa-x"></i>
        </div>
    `;
    const x = fav_movies.querySelector('.fa-x');
    x.addEventListener('click', () => {
        removeMovieLS(movie.id);

        const heart_buttons = document.querySelectorAll('.fa-bookmark');
        heart_buttons.forEach(heart_btn => {
            heart_btn.setAttribute('class', 'fa-regular fa-bookmark');
        });
        fetchFavMovies();
    });

    fav_movies.firstChild.nextSibling.firstChild.nextSibling.addEventListener('click', () => {
        showMoviePopUp(movie);
    });

    fav_movies_container.appendChild(fav_movies);
}

// Вызов функции для получения популярных фильмов
getPopularMovies();

close_popup_button.addEventListener('click', () => {
    popup_container.style.display = 'none';
});

function showMoviePopUp(movie) {
    popup.innerHTML = '';  // Очищаем попап перед добавлением нового контента

    const newPopup = document.createElement('div');
    newPopup.classList.add('pop-up-inner');

    let hour = parseInt(movie.runtime / 60)
    let minut = movie.runtime - hour * 60

    // Вставляем информацию о фильме в новый элемент попапа
    newPopup.innerHTML = `
        <div class="left">
            <div class="movie-card">
                <div class="movie-card-img-container">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="movie-name">
                    <p>${movie.title}</p>
                    <i class="fa-regular fa-bookmark"></i>
                </div>
            </div>
        </div>
        <div class="right">
            <div>
                <h2>Synopsis</h2>
                <p class="movie-info">
                    ${movie.overview}
                </p>
            </div>
            <div>
                <h2>Rating & Runtime</h2>
                <p><strong>Rating:</strong> ${movie.vote_average.toFixed(1)}/10</p>
                <p><strong>Runtime:</strong> ${hour} hour  ${minut} minute</p>
            </div>
            <div>
                <h2>Movie Details</h2>
                <p><strong>Release Date:</strong> ${formatDate(movie.release_date)}</p>
                <p><strong>Status: </strong>${movie.status}</p>
            </div>
            <div>
                <h2>Trailers & Clips</h2>
                <div class="trailer">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${getTrailerKey(movie) || 'defaultVideoId'}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `;

    // Добавляем новый попап в контейнер
    popup.appendChild(newPopup);
    popup_container.style.display = 'flex';  // Показываем попап
}

function getTrailerKey(movie) {
    // Проверяем, есть ли видео в ответе и если есть, ищем трейлер
    if (movie.videos && movie.videos.results) {
        // Ищем видео с типом 'Trailer' (или 'Teaser' для тизеров)
        const trailer = movie.videos.results.find(video => video.type === 'Trailer');
        
        // Если трейлер найден, возвращаем его ключ
        if (trailer) {
            console.log(trailer.key)
            return trailer.key;
        }
    }
    return null;  // Возвращаем null, если трейлер не найден
}

function formatDate(releaseDate) {
    const date = new Date(releaseDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);  // Измените 'en-US' на нужный язык (например, 'ru-RU' для русского)
}

// Light/Dark mode toggle
lightDarkModeSpan.addEventListener('click', () => { // переключение между light mode и dark mode
    if (lightDarkModeIcon.classList.contains('fa-moon')) {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-sun');
    } else {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-moon');
    }

    document.documentElement.classList.toggle('light-theme');
});

// Поиск по названию фильма
searchInput.addEventListener('input', (e) => {
    e.preventDefault()
    const query = e.target.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        getPopularMovies(); // если поле поиска пустое, показываем популярные фильмы
    }
});
