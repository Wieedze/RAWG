document.querySelector('.search-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const input = this.querySelector('input[name="game"]');
  const searchTerm = input.value.trim();

  if (!searchTerm) return;

  const currentHash = window.location.hash; 

  if (currentHash.startsWith('#home')) {

    window.location.hash = `home/search/${encodeURIComponent(searchTerm)}`;

  } else if (currentHash.startsWith('#pagelist')) {

    window.location.hash = `pagelist/${encodeURIComponent(searchTerm)}`;

  } else {

    window.location.hash = `search/${encodeURIComponent(searchTerm)}`;
  }
});
