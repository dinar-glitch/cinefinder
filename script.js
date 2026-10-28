const API_KEY = "d2ddd7ce87ea79d28193def42ccf589c";
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("movieSearch");
const movieGrid = document.getElementById("movieGrid");
const emptyState = document.getElementById("emptyState");
const statusText = document.getElementById("status");
const resultsTitle = document.getElementById("resultsTitle");
const resultsDescription = document.getElementById("resultsDescription");

async function searchMovies(query) {
  if (!query.trim()) return;

  resultsTitle.textContent = `Results for "${query}"`;
  resultsDescription.textContent = "Movies discovered around the world.";
  statusText.textContent = "Searching movies...";
  movieGrid.replaceChildren();
  emptyState.hidden = true;

  try {
    const response = await fetch(
      `${API_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error("Movie search failed. Check your API key.");
    }

    const data = await response.json();
    movieGrid.replaceChildren();

    if (!data.results || data.results.length === 0) {
      statusText.textContent = "No movies found. Try another title.";
      emptyState.hidden = false;
      return;
    }

    data.results.forEach(movie => {
      const card = document.createElement("article");
      card.className = "movie-card";

      if (movie.poster_path) {
        const poster = document.createElement("img");
        poster.className = "poster";
        poster.src = IMAGE_BASE + movie.poster_path;
        poster.alt = `${movie.title} movie poster`;
        poster.loading = "lazy";
        poster.onerror = () => {
          poster.replaceWith(createPlaceholder(movie.title));
        };
        card.appendChild(poster);
      } else {
        card.appendChild(createPlaceholder(movie.title));
      }

      const title = document.createElement("h3");
      title.className = "movie-title";
      title.textContent = movie.title;

      const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "Release year unknown";

      const meta = document.createElement("p");
      meta.className = "movie-meta";
      meta.textContent = year;

      const description = document.createElement("p");
      description.className = "movie-meta";
      description.style.marginTop = "8px";
      description.textContent = movie.overview
        ? movie.overview.slice(0, 130) +
          (movie.overview.length > 130 ? "…" : "")
        : "No description available.";

      const details = document.createElement("a");
      details.className = "search-web";
      details.href =
        `https://www.themoviedb.org/movie/${movie.id}`;
      details.target = "_blank";
      details.rel = "noopener noreferrer";
      details.textContent = "View details ↗";

      card.append(title, meta, description, details);
      movieGrid.appendChild(card);
    });

    statusText.textContent =
      `Found ${data.total_results} matching movies. Showing ${data.results.length}.`;
  } catch (error) {
    statusText.textContent =
      "Unable to load movies. Check your connection and API settings.";
    console.error(error);
  }
}

function createPlaceholder(titleText) {
  const placeholder = document.createElement("div");
  placeholder.className = "poster-placeholder";
  placeholder.textContent = titleText;
  return placeholder;
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchMovies(searchInput.value);
});

document.querySelectorAll("[data-query]").forEach(button => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    searchMovies(button.dataset.query);
  });
});

// Load popular movies when the page opens.
async function loadPopularMovies() {
  resultsTitle.textContent = "Popular Movies";
  resultsDescription.textContent = "Discover what's popular right now.";
  statusText.textContent = "Loading popular movies...";

  try {
    const response = await fetch(
      `${API_BASE}/movie/popular?api_key=${API_KEY}`
    );

    if (!response.ok) throw new Error("Unable to load popular movies.");

    const data = await response.json();

    // Reuse the search function to display real results.
    // The popular endpoint results are already available here.
    displayMovies(data.results);
  } catch (error) {
    statusText.textContent =
      "Popular movies could not load. Try searching for a movie.";
    console.error(error);
  }
}

function displayMovies(movies) {
  movieGrid.replaceChildren();
  emptyState.hidden = true;

  movies.forEach(movie => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const poster = document.createElement("img");
    poster.className = "poster";
    poster.alt = `${movie.title} movie poster`;
    poster.loading = "lazy";

    if (movie.poster_path) {
      poster.src = IMAGE_BASE + movie.poster_path;
    } else {
      poster.replaceWith(createPlaceholder(movie.title));
    }

    const title = document.createElement("h3");
    title.className = "movie-title";
    title.textContent = movie.title;

    const meta = document.createElement("p");
    meta.className = "movie-meta";
    meta.textContent = movie.release_date
      ? movie.release_date.slice(0, 4)
      : "Release year unknown";

    const details = document.createElement("a");
    details.className = "search-web";
    details.href = `https://www.themoviedb.org/movie/${movie.id}`;
    details.target = "_blank";
    details.rel = "noopener noreferrer";
    details.textContent = "View details ↗";

    card.append(title, meta, details);

    if (movie.poster_path) {
      card.prepend(poster);
    }

    movieGrid.appendChild(card);
  });

  statusText.textContent = `Showing ${movies.length} popular movies.`;
}

loadPopularMovies();
