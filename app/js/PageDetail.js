import { API_KEY } from "./config.js";

const PageDetail = (argument) => {
    const preparePage = () => {
        const cleanedArgument = argument.trim().replace(/\s+/g, "-");

        const displayGame = (gameData) => {
            const { name, released, description } = gameData;
            const gameDOM = document.querySelector(".page-detail .game");
            gameDOM.querySelector("h1.title").innerHTML = name;
            gameDOM.querySelector("p.release-date span").innerHTML = released;
            gameDOM.querySelector("p.description").innerHTML = description;
        };

        const fetchGame = (url, argument) => {
            fetch(`${url}/${argument}?key=${API_KEY}`)
                .then((response) => response.json())
                .then((responseData) => {
                    displayGame(responseData);
                });
        };

        fetchGame('https://api.rawg.io/api/games', cleanedArgument);
    };

    const render = () => {
        pageContent.innerHTML = `
        <section class="page-detail">
            <div class="game">
            <h1 class="title"></h1>
            <p class="release-date">Release date : <span></span></p>
            <p class="description"></p>
            </div>
            <div class="multiple-button">
            ${Button("Click here")}
            ${Button("Read more")}
            ${Button("One more !")}
            </div>;
        </section>
    `;

        preparePage();
    };

    render();
};

const Button = (text) => {
    return `<button class="button">${text}</button>`;
};

export default PageDetail;