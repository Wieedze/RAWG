import { API_KEY } from "./config.js";

const Home = (argument = '') => {
    const preparePage = () => {
        const cleanedArgument = argument.trim().replace(/\s+/g, '-');

        const displayResults = (games) => {
            const resultsContent = games.map((game) => (
                `
            <div class="card">
                <div class="card-content">
                    <h1>${game.name}</h1>
                    <h2>${game.released}</h2>
                    <img src="${game.background_image}" class="image" />
                    <a href="#pagedetail/${game.id}">Voir les détails</a>
                </div>
            </div>
        `
            ));

            const resultsContainer = document.querySelector('.page-list .games');
            resultsContainer.innerHTML = resultsContent.join("\n");
        };


        const fetchUpcomingGames = () => {
            const today = new Date();
            const oneYearLater = new Date(today);
            oneYearLater.setFullYear(today.getFullYear() + 1);

            const startDate = today.toISOString().split("T")[0];
            const endDate = oneYearLater.toISOString().split("T")[0];

            const url = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${startDate},${endDate}&ordering=-added&page_size=12`;

            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    displayResults(data.results);
                });
        };

        fetchUpcomingGames();
    };

    const render = () => {
        const pageContent = document.querySelector('#pageContent');
        pageContent.innerHTML = `
            <section class="page-list">
                <div class="games">Loading...</div>
            </section>
            `;

        preparePage();
    };

    render();
};

export default Home;
