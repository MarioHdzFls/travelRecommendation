document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const timeDisplayContainer = document.createElement('div');
    timeDisplayContainer.className = 'time-display-container';
    resultsContainer.prepend(timeDisplayContainer);
    timeDisplayContainer.style.display = 'none';

    searchBtn.addEventListener('click', () => {
        const keyword = searchInput.value.toLowerCase().trim();
        if (keyword) {
            fetch('travel_recommendation_api.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const results = findRecommendations(data, keyword);
                    displayRecommendations(results, resultsContainer, timeDisplayContainer);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    });

    resetBtn.addEventListener('click', () => {
        resultsContainer.innerHTML = '';
        searchInput.value = '';
        timeDisplayContainer.style.display = 'none';
    });
});

function findRecommendations(data, keyword) {
    let recommendations = [];
    if (keyword.includes('beach') || keyword.includes('playa')) {
        recommendations = data.beaches;
    } else if (keyword.includes('temple') || keyword.includes('templo') || keyword.includes('church')) {
        recommendations = data.temples;
    } else {
        const countryData = data.countries.find(country =>
            country.name.toLowerCase().includes(keyword)
        );
        if (countryData) {
            recommendations = countryData.cities;
        }
    }
    return recommendations;
}

function displayRecommendations(recommendations, container, timeDisplayContainer) {
    // 1. Limpiamos los resultados anteriores (esto también elimina el contenedor del tiempo si existía).
    container.innerHTML = '';
    
    // 2. Nos aseguramos de que el contenedor de tiempo esté oculto por defecto.
    timeDisplayContainer.style.display = 'none';

    if (recommendations.length > 0) {
        // 3. Verificamos si el resultado tiene una zona horaria.
        if (recommendations[0].timeZone) {
            // 4. ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE!
            // Volvemos a añadir el contenedor de la hora al principio del 'container'
            // en cada búsqueda que lo necesite.
            container.prepend(timeDisplayContainer);
            
            timeDisplayContainer.style.display = 'block';
            updateTime(timeDisplayContainer, recommendations[0].timeZone);
        }

        // 5. Creamos y añadimos las tarjetas de recomendación como antes.
        recommendations.forEach(item => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <a href="#" class="visit-btn">Visit</a>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<p>No se encontraron recomendaciones para tu búsqueda.</p>';
    }
}

function updateTime(element, timeZone) {
    const options = {
        timeZone: timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };
    
    if (element.interval) {
        clearInterval(element.interval);
    }

    element.interval = setInterval(() => {
        const currentTime = new Date().toLocaleTimeString('en-US', options);
        element.textContent = `Current Local Time (${timeZone}): ${currentTime}`;
    }, 1000);
}