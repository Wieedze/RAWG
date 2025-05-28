import { API_KEY } from "./config.js";

const platformIcons = [
    { match: /PlayStation/, icon: 'assets/icons/playstation.svg' },
    { match: /Xbox/, icon: 'assets/icons/xbox.svg' },
    { match: /Nintendo/, icon: 'assets/icons/nintendo.svg' },
    { match: /PC/, icon: 'assets/icons/pc.svg' },
    { match: /macOS/, icon: 'assets/icons/macos.svg' },
    { match: /Linux/, icon: 'assets/icons/linux.svg' },
    { match: /iOS/, icon: 'assets/icons/ios.svg' },
    { match: /Android/, icon: 'assets/icons/android.svg' },
    { match: /Web/, icon: 'assets/icons/web.svg' }
];

const getPlatformIcon = (platformName) => {
    const match = platformIcons.find(p => p.match.test(platformName));
    return match ? match.icon : null;
};

const fetchGameDetail = (id) => {
    return fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
        .then(res => res.json());
};

function renderPlatformIcons(platforms) {
    const shownIcons = new Set();
    return platforms
        ?.map(p => {
            const name = p.platform.name;
            const icon = getPlatformIcon(name);
            if (icon && !shownIcons.has(icon)) {
                shownIcons.add(icon);
                return `<img src="${icon}" alt="${name}" title="${name}" class="platform-icon" />`;
            }
            return '';
        })
        .join(' ');
}

function renderSimpleRating(rating, ratingsCount) {
    if (!rating || ratingsCount === 0) {
        return `<span class="no-rating">Aucune note</span>`;
    }
    return `
        <div class="simple-rating">
            <span class="average-rating">Note moyenne : ${rating.toFixed(2)}</span>
            <span class="ratings-count">Nombre de votes : ${ratingsCount}</span>
        </div>
    `;
}


function setupPagination({ 
    containerSelector,
    fetchPageCallback,
    renderGamesCallback,
    pageSize = 9
}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container introuvable : ${containerSelector}`);
        return;
    }

    let currentPage = 1;
    let isLastPage = false;

    const btn = document.createElement('button');
    btn.textContent = "Show More";
    btn.style.display = 'none';
    btn.classList.add('show-more-btn');
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.appendChild(btn);
    container.insertAdjacentElement('afterend', wrapper);


    async function loadNextPage() {
        if (isLastPage) return;
        btn.disabled = true;
        btn.textContent = "Loading...";
        try {
            const games = await fetchPageCallback(currentPage);
            if (!games || games.length === 0) {
                isLastPage = true;
                btn.style.display = 'none';
                if (currentPage === 1) {
                    container.innerHTML = '<p>Aucun jeu trouvé.</p>';
                }
                return;
            }

            await renderGamesCallback(games);

            if (games.length < pageSize) {
                isLastPage = true;
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-block';
            }

            currentPage++;
        } catch (err) {
            console.error(err);
            btn.style.display = 'none';
        } finally {
            btn.disabled = false;
            btn.textContent = "Show More";
        }
    }

    btn.addEventListener('click', loadNextPage);

    loadNextPage();
}

function setupCardObserver() {
    const cards = document.querySelectorAll('.card:not(.visible)');

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));
}

const renderGamesBatch = (games) => {
    return Promise.all(games.map(game => fetchGameDetail(game.id)))
        .then(detailedGames => {
            const resultsContent = detailedGames.map(game => (
                `
                <div class="card" data-id="${game.id}">
                    <div class="card-content">
                        <h1>${game.name}</h1>
                        <img src="${game.background_image}" class="image" />
                        <h2>${renderPlatformIcons(game.platforms)}</h2>                     
                    </div>
                    <div class="extra-info">
                        <h2>Publisher: ${game.publishers?.map(pub => pub.name).join(', ') || "N/A"}</h2>
                        <h2>Released: ${game.released}</h2>
                        <h2>Rating :</h2>
                        <div class="ratings">${renderSimpleRating(game.rating, game.ratings_count)}</div>
                    </div>
                </div>
                `
            ));
            const resultsContainer = document.querySelector('.page-list .games');
            resultsContainer.insertAdjacentHTML('beforeend', resultsContent.join("\n"));

            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('click', () => {
                    const gameId = card.getAttribute('data-id');
                    window.location.hash = `#pagedetail/${gameId}`;
                });
            });

            setupCardObserver();
        });
};

const Home = () => {
    // Variable globale pour stocker la plateforme sélectionnée
    let selectedPlatform = '';

    const fetchUpcomingGamesPage = (page) => {
        const today = new Date();
        const oneYearLater = new Date(today);
        oneYearLater.setFullYear(today.getFullYear() + 1);

        const startDate = today.toISOString().split("T")[0];
        const endDate = oneYearLater.toISOString().split("T")[0];

        // Ajout du filtre plateforme si sélectionnée
        const platformParam = selectedPlatform ? `&platforms=${selectedPlatform}` : '';

        const url = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${startDate},${endDate}&ordering=-added&page_size=9&page=${page}${platformParam}`;

        return fetch(url)
            .then(res => res.json())
            .then(data => data.results);
    };

    const preparePage = () => {
        const resultsContainer = document.querySelector('.page-list .games');
        resultsContainer.innerHTML = ''; // Vide avant chargement

        setupPagination({
            containerSelector: '.page-list .games',
            fetchPageCallback: fetchUpcomingGamesPage,
            renderGamesCallback: renderGamesBatch,
            pageSize: 9
        });
    };

    const render = () => {
        const pageContent = document.querySelector('#pageContent');
        pageContent.innerHTML = `
            <section class="page-list">
            <div class="texte">
                <h2>Welcome</h2>
                <p>
                    The Hyper Progame is the world’s premier event for computer and video games and related products. At The Hyper Progame,
                    the video game industry’s top talent pack the Los Angeles Convention Center, connecting tens of thousands of the best,
                    brightest, and most innovative in the interactive entertainment industry. For three exciting days, leading-edge companies,
                    groundbreaking new technologies, and never-before-seen products will be showcased. The Hyper Progame connects you
                    with both new and existing partners, industry executives, gamers, and social influencers providing unprecedented exposure
                </p>

                </div>
                <div id="filtersWrapper"></div>
                <div class="games">Loading...</div>
            </section>
        `;

        // Création du filtre plateforme (select)
        const filtersWrapper = document.getElementById('filtersWrapper');
        filtersWrapper.innerHTML = `
            <div class="platform-select-wrapper">
                <label for="platformSelect"></label>
                <select id="platformSelect">
                    <option value="">Platform : Any</option>
                    <optgroup label="PC et Mobile">
                        <option value="4">PC</option>
                        <option value="5">macOS</option>
                        <option value="6">Linux</option>
                        <option value="3">iOS</option>
                        <option value="21">Android</option>
                        <option value="14">Web</option>
                    </optgroup>
                    <optgroup label="PlayStation">
                        <option value="187">PlayStation 5</option>
                        <option value="18">PlayStation 4</option>
                    </optgroup>
                    <optgroup label="Xbox">
                        <option value="186">Xbox Series S/X</option>
                        <option value="1">Xbox One</option>
                    </optgroup>
                    <optgroup label="Nintendo">
                        <option value="7">Nintendo Switch</option>
                    </optgroup>
                </select>
            </div>
        `;

        // Événement au changement de sélection : on met à jour la variable et on recharge la liste
        document.getElementById('platformSelect').addEventListener('change', (e) => {
            selectedPlatform = e.target.value;
            preparePage();
        });

        preparePage();
    };

    render();
};

export default Home;
