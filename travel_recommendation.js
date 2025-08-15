function fetchAndLogData() {
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Aquí verás los datos en la consola
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Llama a la función para verificar que funciona
fetchAndLogData();

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    searchBtn.addEventListener('click', () => {
        const keyword = searchInput.value.toLowerCase().trim();
        fetch('travel_recommendation_api.json')
            .then(response => response.json())
            .then(data => {
                const results = findRecommendations(data, keyword);
                displayRecommendations(results, resultsContainer);
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    resetBtn.addEventListener('click', () => {
        resultsContainer.innerHTML = ''; // Limpia los resultados
        searchInput.value = ''; // Limpia el campo de búsqueda
    });
});

function findRecommendations(data, keyword) {
    let recommendations = [];
    if (keyword.includes('beach') || keyword.includes('playa')) {
        recommendations = data.beaches;
    } else if (keyword.includes('temple') || keyword.includes('templo')) {
        recommendations = data.temples;
    } else {
        // Busca en los países
        const countryData = data.countries.find(country => 
            country.name.toLowerCase().includes(keyword) || 
            keyword.includes(country.name.toLowerCase())
        );
        if (countryData) {
            recommendations = countryData.cities;
        }
    }
    return recommendations;
}

function displayRecommendations(recommendations, container) {
    container.innerHTML = '';
    if (recommendations.length > 0) {
        recommendations.forEach(item => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="time-display"></div>
            `;
            container.appendChild(card);
            
            // Tarea 10: Mostrar la hora
            if (item.timeZone) {
                updateTime(card.querySelector('.time-display'), item.timeZone);
            }
        });
    } else {
        container.innerHTML = '<p>No se encontraron recomendaciones para tu búsqueda.</p>';
    }
}

resetBtn.addEventListener('click', () => {
    resultsContainer.innerHTML = ''; // Limpia los resultados
    searchInput.value = ''; // Limpia el campo de búsqueda
});

function updateTime(element, timeZone) {
    const options = {
        timeZone: timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    
    // Función que se ejecuta cada segundo para actualizar la hora
    setInterval(() => {
        const currentTime = new Date().toLocaleTimeString('es-ES', options);
        element.textContent = `Hora actual: ${currentTime}`;
    }, 1000);
}