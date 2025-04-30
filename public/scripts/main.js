fetch('../data/all_fruits.json')
    .then(response => response.json())
    .then(data => {
        const fruitsContainer = document.getElementById('fruits-container');
        data.forEach(fruit => {
            const fruitElement = document.createElement('div');
            fruitElement.classList.add('fruit');

            const nameElement = document.createElement('h2');
            nameElement.textContent = fruit.name;

            const valuesElement = document.createElement('div');
            valuesElement.innerHTML = `
                <p>Status: ${fruit.values.status}</p>
                <p>Value: ${fruit.values.value}</p>
                <p>Demand: ${fruit.values.demand}</p>
            `;

            fruitElement.appendChild(nameElement);
            fruitElement.appendChild(valuesElement);
            fruitsContainer.appendChild(fruitElement);
        });
    })
    .catch(error => console.error('Error fetching fruit data:', error));