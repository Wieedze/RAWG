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

// Renvoie l’icône correspondant au nom d’une plateforme, ou null si aucune
const getPlatformIcon = (platformName) => {
    const match = platformIcons.find(p => p.match.test(platformName));
    return match ? match.icon : null;
};

// Génère le HTML des icônes plateformes, sans doublons
function renderPlatformIcons(platforms) {
    const shownIcons = new Set();
    return platforms?.map(p => {
        const name = p.platform.name;
        const icon = getPlatformIcon(name);
        if (icon && !shownIcons.has(icon)) {
            shownIcons.add(icon);
            return `<img src="${icon}" alt="${name}" title="${name}" data-name="${name}" class="platform-icon" />`;

        }
        return '';
    }).join(' ');
}

// Fonction principale de la page détail, prend un argument (slug ou nom de jeu)
const PageDetail = (argument) => {
    const pageContent = document.querySelector("#pageContent");

    // Charge et affiche les données du jeu
    const fetchGame = (url, argument) => {
        const finalURL = `${url}${argument}?key=${API_KEY}`;

        fetch(finalURL)
            .then(response => response.json())
            .then(data => {
                const {
                    name,
                    released,
                    description,
                    website,
                    publishers,
                    background_image,
                    developers,
                    platforms,
                    genres,
                    tags,
                    rating,
                    ratings_count,
                    stores
                } = data;

                const articleDOM = document.querySelector(".page-detail .article");

                articleDOM.querySelector("img.main-img").src = background_image;
                articleDOM.querySelector("h1.title").textContent = name;
                articleDOM.querySelector("h3.ratings").textContent = `${rating}/5 - ${ratings_count} ratings`;
                articleDOM.querySelector("span.release-date").textContent = released;
                articleDOM.querySelector("p.description").innerHTML = description;

                const spanWebsite = document.querySelector("span.website");
                spanWebsite.innerHTML = "";

                if (website) {
                    const btn = document.createElement("button");
                    btn.textContent = "Official Website";
                    btn.className = "btn-website";

                    btn.addEventListener("click", () => {
                        window.open(website, "_blank");
                    });
                    spanWebsite.appendChild(btn);
                }

                const spanPlatforms = articleDOM.querySelector("span.platforms");
                spanPlatforms.innerHTML = renderPlatformIcons(platforms);

                spanPlatforms.querySelectorAll(".platform-icon").forEach(icon => {
                    icon.addEventListener("click", (e) => {
                        const platformName = e.target.dataset.name;
                        const input = document.getElementById("searchInput");
                        if (input) input.value = platformName;
                        window.location.hash = "#pagelist";
                    });
                });

                const spanPublisher = document.querySelector("span.publishers");
                spanPublisher.innerHTML = publishers.map(publishers => `<a href="#pagelist" class="publishers-link" data-name="${publishers.name}">${publishers.name}</a>`)
                    .join("<br>");
                spanPublisher.querySelectorAll(".publishers-link").forEach(link => {
                    link.addEventListener("click", (event) => {
                        const publishersName = event.target.dataset.name;
                        const input = document.getElementById("searchInput");
                        if (input) input.value = publishersName;
                    });
                });

                const spanDev = document.querySelector("span.developers");
                spanDev.innerHTML = developers.map(dev => `<a href="#pagelist" class="dev-link" data-name="${dev.name}">${dev.name}</a>`)
                    .join("<br>");
                spanDev.querySelectorAll(".dev-link").forEach(link => {
                    link.addEventListener("click", (event) => {
                        const devName = event.target.dataset.name;
                        const input = document.getElementById("searchInput");
                        if (input) input.value = devName;
                    });
                });

                const spanTags = document.querySelector("span.tags");
                spanTags.innerHTML = tags.map(t => `<a href="#pagelist" class="tag-link" data-name="${t.name}">${t.name}</a>`)
                                        .join(", ");
                spanTags.querySelectorAll(".tag-link").forEach(link => {
                    link.addEventListener("click", (event) => {
                        const tagName = event.target.dataset.name
                        const input = document.getElementById("searchInput");
                        if (input) input.value = tagName;
                    })
                })


                const spanType = document.querySelector("span.genres");
                spanType.innerHTML = genres.map(g =>`<a href="#pagelist" class="tag-link" data-name="${g.name}">${g.name}</a>`)
                                            .join(', ');
                    spanType.querySelectorAll(".tag-link").forEach(link => {
                    link.addEventListener("click", (event) => {
                        const typeName = event.target.dataset.name
                        const input =document.getElementById("searchInput");
                        if(input) input.value = typeName
                    })
                });

                const spanBuy = document.querySelector("span.buy");
                    spanBuy.innerHTML =stores.map(s => `<a href="https://${s.store.domain}" class="store-link" data-name="${s.store.name}" target="_blank">${s.store.name}</a>`)
                                            .join("<br>");
                })

            .catch(err => {
                console.error("Erreur fetchGame:", err);
            });
    };

    // Charge et affiche les screenshots
    const fetchScreenshots = (url, argument) => {
        const finalURL = `${url}${argument}/screenshots?key=${API_KEY}`;

        fetch(finalURL)
            .then(response => response.json())
            .then(data => {
                const { results } = data;
                const grid = document.querySelector(".screenshots-grid");
                grid.innerHTML = ''; // Vider avant d'ajouter

                results.slice(0, 10).forEach(screenshot => {
                    const img = document.createElement("img");
                    img.src = screenshot.image;
                    img.alt = "Screenshot";
                    img.className = "screenshot-img";
                    grid.appendChild(img);
                });
                openPicture()
            })
            .catch(err => {
                console.error("Erreur fetchScreenshots:", err);
            });
    };

    function openPicture() {
        const pictures = document.getElementsByClassName("screenshot-img");
        const modal = document.getElementById("modal");
        const modalImg = document.getElementById("modal-img");
        const modalClose = modal.querySelector(".modal-close");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        let currentIndex = 0;

        function showPicture(index) {
            if (index < 0) index = pictures.length - 1;
            if (index >= pictures.length) index = 0;
            currentIndex = index;
            modalImg.src = pictures[currentIndex].src;
            modalImg.alt = pictures[currentIndex].alt;
        }

        // Ajout des événements une seule fois, ici :
        Array.from(pictures).forEach((picture, index) => {
            picture.addEventListener('click', () => {
                modal.style.display = 'flex';
                showPicture(index);
            });
        });

        modalClose.addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showPicture(currentIndex - 1);
        });

        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showPicture(currentIndex + 1);
        });
    }

    const preparePage = () => {
        const cleanedArgument = argument.trim().replace(/\s+/g, "-");

        fetchGame("https://api.rawg.io/api/games/", cleanedArgument);
        fetchScreenshots("https://api.rawg.io/api/games/", cleanedArgument);
        fetchVideo("https://api.rawg.io/api/games/", cleanedArgument);

    };

    const generateGameCards = (games) => {
        const container = document.querySelector(".related-games");
        container.innerHTML = "";

        const renderCards = () => {
            container.innerHTML = games
                .map(game => `
                    <a href="#pagedetail/${game.id}" class="game-card">
                        <img src="${game.background_image}" alt="${game.name}" />
                        <h3>${game.name}</h3>
                        <p>Released: ${game.released}</p>
                    </a>
                `)
                .join("");
        };
        renderCards();
    };


    const render = () => {
        pageContent.innerHTML = `
            <section class="page-detail">
                <div class="article">
                <img class="main-img" src="" alt="Game banner" />
                <span class="website"></span>
                    <div class="title-row">
                        <h1 class="title"></h1> <h3 class="ratings"></h3>
                        <p class="description"></p>
                    </div>

                    <div class="game-info">
                        <p class="release-date"><strong>Release Date:</strong><br><span class="release-date"></span></p>
                        <p class="developers"><strong>Developers:</strong><br><span class="developers"></span></p>
                        <p class="platforms"><strong>Platforms:</strong><br><span class="platforms"></span></p>
                        <p class="publishers"><strong>Publishers:</strong><br><span class="publishers"></span></p>
                        <p class="genres"><strong>Genres:</strong><br><span class="genres"></span></p>
                        <p class="tags"><strong>Tags:</strong><br><span class="tags"></span></p>
                    </div>

                    <div class="buy">
                        <p class="title"><strong>Buy</strong></p>
                        <span class="buy"></span>
                    </div>

                    <div class="screenshots-grid"></div>
                    <div id="modal" class="modal" style="display:none;">
                        <span class="modal-close">&times;</span>
                            <button id="prevBtn" class="carousel-btn">‹</button>
                                <img class="modal-content" id="modal-img" alt="Screenshot agrandi" />
                            <button id="nextBtn" class="carousel-btn">›</button>
                    </div>


                    <h2>Similar Games</h2>
                    <div class="related-games"></div>
                </div>
            </section>
        `;

        preparePage();

        // Charger et afficher les jeux similaires
        fetch(`https://api.rawg.io/api/games?key=${API_KEY}&ordering=-rating&page_size=12`)
            .then(res => res.json())
            .then(data => {
                generateGameCards(data.results);
            })
            .catch(err => {
                console.error("Erreur fetch related games:", err);
            });
    };

    render();
};

export default PageDetail;
