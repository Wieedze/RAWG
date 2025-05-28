// Import de la clé API depuis un fichier de configuration
import { API_KEY } from "./config.js";

// Liste des plateformes avec leur regex de correspondance et le chemin vers leur icône
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

// Retourne l'icône correspondant au nom de la plateforme
const getPlatformIcon = (platformName) => {
    const match = platformIcons.find(p => p.match.test(platformName));
    return match ? match.icon : null;
};

// Génère le HTML des icônes de plateformes sans doublons
function renderPlatformIcons(platforms) {
    const shownIcons = new Set(); // Pour éviter les doublons
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

// Récupère les détails complets d’un jeu à partir de son ID
const fetchGameDetail = (id) => {
    return fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
        .then(res => res.json());
};

function renderSimpleRating(rating, ratingsCount) {
    if (!rating || ratingsCount === 0) {
        return `<span class="no-rating">Aucune note</span>`;
    }
    return `
        <div class="simple-rating">
            <span class="average-rating"> ${rating.toFixed(2)}/5</span>
            <span class="ratings-count">Total Vote : ${ratingsCount}</span>
        </div>
    `;
}

// Gestion de la pagination avec bouton "Afficher plus"
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

    const existingWrapper = container.nextElementSibling;
    if (existingWrapper && existingWrapper.classList.contains('pagination-wrapper')) {
        existingWrapper.remove();
    }

    let currentPage = 1;
    let isLastPage = false;

    const btn = document.createElement('button');
    btn.textContent = "Afficher plus";
    btn.style.display = 'none';
    btn.classList.add('show-more-btn');

    const wrapper = document.createElement('div');
    wrapper.classList.add('pagination-wrapper');
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
            btn.textContent = "Show more";
        }
    }

    btn.addEventListener('click', loadNextPage);

    loadNextPage();
}

// Observer pour afficher progressivement les cartes avec animation
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

// Fonction principale pour afficher la liste des jeux (avec pagination et filtres)
const PageList = () => {

    // Récupère la plateforme sélectionnée et la recherche depuis un input ou variable (ici on prend un champ input#searchInput)
    const getSearchTerm = () => {
        const input = document.getElementById('searchInput');
        return input ? input.value.trim() : '';
    };

    // Récupère une page de jeux en fonction de la plateforme sélectionnée et recherche
    function fetchGamesPage(page) {
        const selectedPlatform = document.getElementById("platformSelect")?.value;
        const platformParam = selectedPlatform ? `&platforms=${selectedPlatform}` : '';
        const searchTerm = getSearchTerm();
        const searchParam = searchTerm ? `&search=${searchTerm}` : '';
        const url = `https://api.rawg.io/api/games?key=${API_KEY}&ordering=-added&page_size=9&page=${page}${platformParam}${searchParam}`;

        return fetch(url)
            .then(res => res.json())
            .then(data => data.results);
    }

    // Affiche un lot de jeux avec les détails (nom, image, plateformes, éditeur, notes, etc.)
    function renderGamesBatch(games) {
        return Promise.all(games.map(game => fetchGameDetail(game.id)))
            .then(detailedGames => {
                const resultsContent = detailedGames.map(game => (
                    `
                    <div class="card game" data-id="${game.id}" data-platform="${game.parent_platforms?.[0]?.platform?.name}">
                        <div class="card-content">
                            <h1>${game.name}</h1>
                            <img src="${game.background_image}" class="image" />
                            <h2>${renderPlatformIcons(game.platforms)}</h2>                     
                        </div>
                        <div class="extra-info">
                            <h2>Éditeur : ${game.publishers?.map(pub => pub.name).join(', ') || "N/A"}</h2>
                            <h2>Date de sortie : ${game.released}</h2>
                            <h2>Genres : ${game.genres?.map(pub => pub.name).join(', ') || "N/A"}</h2>
                            <div class="ratings">${renderSimpleRating(game.rating, game.ratings_count)}</div>

                        </div>
                    </div>
                    `
                ));
                const resultsContainer = document.querySelector('.page-list .games');
                resultsContainer.insertAdjacentHTML('beforeend', resultsContent.join("\n"));

                // Ajoute l’événement click sur chaque carte pour aller à la page de détail
                document.querySelectorAll('.card').forEach(card => {
                    card.addEventListener('click', () => {
                        const gameId = card.getAttribute('data-id');
                        window.location.hash = `#pagedetail/${gameId}`;
                    });
                });

                setupCardObserver();
            });
    }

    // Réinitialise la page et initialise la pagination
    const preparePage = () => {
        const resultsContainer = document.querySelector('.page-list .games');
        resultsContainer.innerHTML = '';

        setupPagination({
            containerSelector: '.page-list .games',
            fetchPageCallback: fetchGamesPage,
            renderGamesCallback: renderGamesBatch,
            pageSize: 9
        });
    };

    // Affiche la structure de la page avec le filtre de plateformes + input de recherche
    const render = () => {
        pageContent.innerHTML = `
        <section class="page-list">
            <div id="filtersWrapper"></div>
            <div class="games">Loading...</div>
        </section>
        `;

        const filtersWrapper = document.getElementById('filtersWrapper');
        filtersWrapper.innerHTML = '';

        const filtersContainer = document.createElement('div');
        filtersContainer.innerHTML = `
            <div class="platform-select-wrapper">
                <label for="platformSelect"></label>
                <select id="platformSelect">
                    <option value="">Platform: Any</option>
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
        filtersWrapper.appendChild(filtersContainer);

        // Rafraîchit la liste à chaque changement de filtre ou recherche
        document.getElementById('platformSelect').addEventListener('change', preparePage);
        document.getElementById('searchBtn').addEventListener('click', preparePage);
        document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
        preparePage();
    }
});
        preparePage(); // Chargement initial
    };

    render(); // Lancement de la page
};

export default PageList;
