import "core-js/stable";
import "regenerator-runtime/runtime";

import * as model from "./model.js";
import { MOVIES_FIRST_PAGE, MOVIES_MAX_PAGE } from "./config.js";
import sideBarBtnsView from "./views/sideBarBtnsView.js";
import discoverMoviesView from "./views/discoverView.js";
import popularMoviesView from "./views/popularMoviesView.js";
import trendingView from "./views/trendingView.js";
import popularTVsView from "./views/popularTVsView.js";
import searchResultsView from "./views/searchResultsView.js";
import paginationView from "./views/paginationView.js";
import expansionView from "./views/expansionView.js";
import bookmarksView from "./views/bookmarksView.js";
import {
  controlMovieCards,
  createMovieObj,
  showExpandOverlay,
} from "./helpers.js";
import genreCardsView from "./views/genreCardsView.js";
import cardZoomingView from "./views/movieSectionView.js";
import othersView from "./views/othersView.js";
import movieSectionView from "./views/movieSectionView.js";

let expandSecIsActive = false;

// prettier-ignore
const controlDiscoverMovies = async function () {
  try {
    // Movie Card's Controller
    controlMovieCards(discoverMoviesView, "discoverMovies", "home");
    sideBarBtnsView.updateBtn();
  } catch (error) {
    console.log(error);
  }
};

const controlNavBtns = async function (event) {
  try {
    const sidebar = document.querySelector(".movie-sidebar-nav");
    const toolTip = document.querySelectorAll(".secondary-title");
    await sideBarBtnsView.renderActive(event);
    // Prevents the data to be rendered again everytime user clicks the same button;
    if (sideBarBtnsView.buttonPage === model.data.pages.currentPageType) return;

    // Prevents HTML from rendering when expand button has been clicked
    if (sideBarBtnsView.buttonPage === "expand") return;

    // Render HTML cards and paginations buttons
    if (sideBarBtnsView.buttonPage === "home") {
      controlMovieCards(discoverMoviesView, "discoverMovies", "home");
    }
    if (sideBarBtnsView.buttonPage === "movies-pop") {
      controlMovieCards(popularMoviesView, "popularMovies", "movies-pop");
    }
    if (sideBarBtnsView.buttonPage === "trending") {
      controlMovieCards(trendingView, "trendingMovies", "trending");
    }
    if (sideBarBtnsView.buttonPage === "tvs-pop") {
      controlMovieCards(popularTVsView, "popularTVS", "tvs-pop");
    }
    if (sideBarBtnsView.buttonPage === "bookmarks") {
      genreCardsView.renderGenreErrorMsg();
      // Render's Loading Spinner
      bookmarksView.renderLoading();

      model.data.pages.currentPageType = "bookmark";
      // Render's HTML Cards
      await bookmarksView.renderHTML(model.data.bookMarksData);
    }

    if (sidebar.classList.contains("active")) {
      showExpandOverlay("remove", "auto");
      sidebar.classList.remove("active");
      toolTip.forEach((el) => (el.style.visibility = "hidden"));
      // prettier-ignore
      setTimeout(()=> toolTip.forEach((el) => (el.style.visibility = "visible")),500)
    }
  } catch (error) {
    throw error;
  }
};

const controlSearchResults = async function () {
  try {
    // Render error message in genre container
    genreCardsView.renderGenreErrorMsg();
    // Remove's active icons in sidebar
    sideBarBtnsView.updateBtn("search-res");
    sideBarBtnsView.buttonPage = "search";
    // Takes Search Input Value
    const searchVal = searchResultsView.getInputValue();
    // Render's Loading Spinner
    searchResultsView.renderLoading();
    // Creates Result's Data
    await model.createSearchResults(searchVal);
    // Renders HTML Card's
    searchResultsView.renderHTML(model.data.searchResults);
  } catch (error) {
    searchResultsView.renderErrorMsg(error.message);
  }
};

// prettier-ignore
const controlPagination = async function (event) {
  try {
    // Starts the function when one of the buttons has been clicked
    paginationView.buttonClicked(event);

    // Stops the function if btn Type is nothing
    if (paginationView.btnType === "") return;

    // Stops the function if user clicks back and the page is number 1
    if (paginationView.btnType === "back" && model.data.pages.currentPage === MOVIES_FIRST_PAGE) return;

    // Stops the function if user clicks next and the page is the last page
    if (paginationView.btnType === "next" && model.data.pages.currentPage === MOVIES_MAX_PAGE) return;

    // Renders Loading Spinner
    paginationView.renderLoading();

    // Fetches PageResults Data
    await model.createPageResults(paginationView.btnType, paginationView.pageNum);

    // Render's Pagination buttons and HTML Card's
    paginationView.renderHTML(model.data.pages.pageResults);
    paginationView.renderPagination(model.data.pages.currentPageLast);
  } catch (error) {
    console.log(error);
  }
};

const controlMovieSection = async function (e) {
  let expandDuration;
  // This function wont work if expand section is already active
  if (expandSecIsActive) return;

  expandSecIsActive = true;

  const sidebar = document.querySelector(".movie-sidebar-nav");
  const btn = e.target.closest(".expand-btn");

  if (!btn) return;

  const expandSection = document.querySelector(".expansion-section");
  const movieCard = e.target.closest(".movie-card");
  const btnId = btn.dataset.cardId;

  window.location.hash = btnId;

  if (model.data.cardZooming) {
    expandDuration = 400;
    cardZoomingView.renderCardZoom(movieCard);
  }

  // Shrink's sections in the html and disable sidebar buttons pointer event
  movieSectionView.shrinkSections();

  // Shows the expansion section after 400ms
  setTimeout(() => {
    controlExpansionSection();
    expandSection.classList.add("active");
  }, expandDuration);
};

const controlExpandBackButton = function (e) {
  const expandSection = document.querySelector(".expansion-section");
  const cardClone = document?.querySelector(".movie-card-clone");

  let expandDuration;

  window.location.hash = "";

  expandSection.classList.remove("active");

  if (model.data.cardZooming && cardClone) {
    cardZoomingView.renderCardShrink();
    expandDuration = 600;
  }

  setTimeout(() => (expandSecIsActive = false), expandDuration);

  setTimeout(() => movieSectionView.unShrinkSections(), expandDuration / 2);

  if (model.data.cardZooming) return;
};

// prettier-ignore
const controlBookmarkBtn = async function (isActive) {
  try {
    const id = +window.location.hash.slice(1);
    
    if (!id) return;

    // Inserts the bookmarked id in the data.
    if (isActive) {
      const dataHolder = [];
      dataHolder.push(model.data.expansion.videoDetails)
      const bookMarkData = createMovieObj(dataHolder)
      model.data.bookMarksData.push(...bookMarkData);
      // model.data.bookMarksData.push(id);
    }

     // Removes the bookmarked id in the data.
    if (!isActive) {
      const newBookmarkData = model.data.bookMarksData.filter((val) => val.id !== id);
      model.data.bookMarksData = newBookmarkData;
    }
    console.log(model.data.bookMarksData);
  } catch (error) {
    console.log(error);
  }
};

// prettier-ignore
const controlExpansionSection = async function () {
  try {
    const movieCard = document.querySelector(".movie-card");
    const videoId = +window.location.hash.slice(1);

    expansionView.renderLoading();

    await model.createExpandPage(videoId);

    // Check if the exoanded movie/tvs is already bookmarked by the user
    const isBookMarked = model.data.bookMarksData.some(data => data.id === videoId);

    if (!model.data.expansion.videoData) return;

    // Rendering HTML
    await expansionView.renderHTML(
      model.data.expansion.videoData,
      model.data.expansion.videoDetails,
      model.data.expansion.videoCasts,
      isBookMarked
    );

    expansionView.addEventHandler(controlBookmarkBtn);
    console.log(model.data.expansion.videoDetails);
  } catch (error) {
    console.log(error);
  }
};

const renderGenreCards = async function () {
  try {
    // Renders Loading Spinner
    paginationView.renderLoading();
    // Create's Genre Cards
    await model.createGenreCards();
    // Render's the result to the DOM
    genreCardsView.renderHTML(model.data.genre.genresResult);
    // Render's Pagination in the DOM
    paginationView.renderPagination(model.data.pages.currentPageLast);
  } catch (error) {
    console.error(error);
    genreCardsView.renderErrorMsg(error.message);
  }
};

const controlGenreCards = async function (event) {
  try {
    const btn = event.target.closest(".filters-btn");
    const genreArr = model.data.genre.genreArr;

    if (!btn) return;

    // Sets Pagination View Pagenumber to pageNum
    paginationView.pageNum = 1;

    if (!btn.classList.contains("active")) {
      genreArr.push(btn.dataset.genreId);
      btn.classList.add("active");
      renderGenreCards();
      return;
    }

    // if btn is already active then this condition happens
    if (btn.classList.contains("active")) {
      genreArr.pop(btn.dataset.genreId);
      btn.classList.remove("active");
      renderGenreCards();
      return;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const init = function () {
  // Take's bookmark data in the localstorage.
  const bookMarksData = JSON.parse(localStorage.getItem("bookmarksData"));
  model.data.bookMarksData = [...new Set(bookMarksData)];
  console.log(model.data.bookMarksData);
  // Loads Discover Movie Card's when page is loaded.
  controlDiscoverMovies();

  // Attach Event Handlers
  movieSectionView.addBackEventHandler(controlExpandBackButton);
  searchResultsView.addHandlerEvent(controlSearchResults);
  movieSectionView.addEventHandler(controlMovieSection);
  genreCardsView.addEventHandler(controlGenreCards);
  paginationView.addHandlerEvent(controlPagination);
  sideBarBtnsView.addHandlerEvent(controlNavBtns);

  // Takes the darkmode data in the local storage
  const darkMode = JSON.parse(localStorage.getItem("darkmode"));

  if (!darkMode) return;
  // Toggles the darkMode button if DarkMode in localStorage is true and when page is in index.html
  const darkModeBtn = document?.querySelector(".dark-list");
  darkModeBtn?.classList.toggle("active");
  document.body.classList.toggle("darkmode");
};

init();

window.addEventListener("load", function () {
  if (this.window.location.hash) {
    expandSecIsActive = true;
    // Shrink's sections in the html and disable sidebar buttons pointer event
    movieSectionView.shrinkSections();

    document.querySelector(".expansion-section").classList.add("active");
    controlExpansionSection();
  }
});

// prettier-ignore
// Saves Bookmarks Data to the localstorage.
window.onbeforeunload = () => localStorage.setItem("bookmarksData",JSON.stringify(model.data.bookMarksData));
