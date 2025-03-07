import { IMG_PATH } from "../config";

export default class mainView {
  _paginationSection = document.querySelector(".movie-pagination");
  _parentEl = document.querySelector(".movie-cards");
  _movieData;

  _headTitle = document.querySelector(".header-title");
  _title = "Discover Movies";
  viewName = "discoverMoviesView";
  _mainMovieSection = document.querySelector(".movie-main");
  _headerSection = document.querySelector(".section-header");
  _paginationSection = document.querySelector(".movie-pagination");
  _sidebar = document.querySelector(".movie-sidebar-nav");

  renderHTML(movieData) {
    console.log(movieData);
    this._movieData = movieData;
    this._clearHTML();
    this._generateHTML();
    this._updateTitle();
    this._scrollToTop();
  }

  renderErrorMsg(errorMsg) {
    const errorMarkup = `
    <div class="error-msg">
      <i class="ph-icon ph-warning"></i>
      <span class="img-unavailable-text">${errorMsg}</span>
    </div>
    `;

    this._clearHTML();
    this._parentEl.insertAdjacentHTML("beforeend", errorMarkup);
  }

  renderLoading() {
    const loadingHTML = `
    <div class="placeholder"></div>
    <div class="loading-spinner"></div>
    <div class="loading-spinner2"></div>
     `;
    this._clearHTML();
    this._parentEl.insertAdjacentHTML("beforeend", loadingHTML);
  }

  _scrollToTop() {
    window.scrollTo({
      top: 0,
    });
  }

  _updateTitle() {
    this._headTitle.textContent = this._title;
  }

  _clearHTML() {
    this._parentEl.innerHTML = "";
    this._paginationSection.innerHTML = "";
  }

  // prettier-ignore
  _generateHTML() {
    this._movieData.forEach((movie) => {
      const markupHTML = `
          <div class="movie-card">
          ${movie.img !== null ? `
            <img
            class="movie-img"
            src="${IMG_PATH + movie.img}"
            alt="${movie.title}"/>
            ` : `
            <div class="card img-card">
              <i class="ph-icon ph-warning"></i>
              <span class="img-unavailable-text">Image <br> Unavailable</span>
            </div>
            `
          }
          <div class="overlay-card"></div>

          <button data-card-id="${movie.id}" class="expand-btn">
          <span class="movie-expand"></span>
          <i class="bx bx-expand expand-icon"></i>Expand</span>
          </button>
          <div class="movie-info">
            <span class="movie-title">${movie.title}</span>
          </div>
        </div>
          `;
      this._parentEl.insertAdjacentHTML("beforeend", markupHTML);
    });
  }
}
