import { API_KEY } from "./config.js";

const PageList = (argument = '') => {
    const preparePage = () => {
        const cleanedArgument = argument.trim().replace(/\s+/g, '-');

        const displayResults = (games) => {
            const resultsContent = games.map((game) => (
            `
                <div class= "card">
                    <div class="card-content">
                        <h1>${game.name}</h1>
                        <h2>${game.released}</h2>
                        <img src="${game.background_image}" class="image" />
                        <a href="#pagedetail/${game.id}">Voir les détails</a>
                    </div>
                </div>`
            ));
            const resultsContainer = document.querySelector('.page-list .games');
            resultsContainer.innerHTML = resultsContent.join("\n");
        };

        const fetchList = (url, argument) => {
            const finalURL = argument ? `${url}&search=${argument}` : url;
            fetch(finalURL)
                .then((response) => response.json())
                .then((responseData) => {
                    displayResults(responseData.results)
                });
        };

        fetchList(`https://api.rawg.io/api/games?key=${API_KEY}`, cleanedArgument);
    };

    const render = () => {
        pageContent.innerHTML = `
        <section class="page-list">
            <div class="games">Loading...</div>
        </section>
    `;

        preparePage();
    };

    render();
};

export default PageList;