import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    
    /**
     * Handles favoriting or unfavoriting an article.
     * @param {Object} action.payload.article - The article being favorited/unfavorited.
     * @returns {Object} The updated state with the modified article's favorited status.
     */
    case ARTICLE_FAVORITED:
    case ARTICLE_UNFAVORITED:
      return {
        ...state,
        articles: state.articles.map(article => {
          if (article.slug === action.payload.article.slug) {
            return {
              ...article,
              favorited: action.payload.article.favorited,
              favoritesCount: action.payload.article.favoritesCount
            };
          }
          return article;
        })
      };

    /**
     * Handles setting the current page for articles.
     * @param {Object} action.payload - The payload containing the articles and article count.
     * @param {number} action.page - The current page number.
     * @returns {Object} The updated state with the current page's articles.
     */
    case SET_PAGE:
      return {
        ...state,
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        currentPage: action.page
      };

    /**
     * Applies a filter based on the selected tag.
     * @param {string} action.tag - The selected tag for filtering articles.
     * @param {Object} action.payload.articles - The filtered articles.
     * @param {number} action.payload.articlesCount - The total count of filtered articles.
     * @param {function} action.pager - A function to handle pagination for the filtered articles.
     * @returns {Object} The updated state with filtered articles based on the selected tag.
     */
    case APPLY_TAG_FILTER:
      return {
        ...state,
        pager: action.pager,
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        tab: null,
        tag: action.tag,
        currentPage: 0
      };

    /**
     * Loads the homepage with tags and articles.
     * @param {Object} action.payload - The payload containing tags and articles.
     * @param {string} action.tab - The current tab selected.
     * @returns {Object} The updated state with homepage data.
     */
    case HOME_PAGE_LOADED:
      return {
        ...state,
        pager: action.pager,
        tags: action.payload[0].tags,
        articles: action.payload[1].articles,
        articlesCount: action.payload[1].articlesCount,
        currentPage: 0,
        tab: action.tab
      };

    /**
     * Unloads the homepage.
     * @returns {Object} An empty state, resetting the homepage data.
     */
    case HOME_PAGE_UNLOADED:
      return {};

    /**
     * Changes the current tab and reloads articles for the selected tab.
     * @param {Object} action.payload - The payload containing the articles for the selected tab.
     * @param {number} action.payload.articlesCount - The total count of articles.
     * @param {string} action.tab - The selected tab.
     * @returns {Object} The updated state with articles for the selected tab.
     */
    case CHANGE_TAB:
      return {
        ...state,
        pager: action.pager,
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        tab: action.tab,
        currentPage: 0,
        tag: null
      };

    /**
     * Loads the profile page or profile favorites page with articles.
     * @param {Object} action.payload.articles - The user's profile articles.
     * @param {number} action.payload.articlesCount - The total count of profile articles.
     * @returns {Object} The updated state with the profile's articles.
     */
    case PROFILE_PAGE_LOADED:
    case PROFILE_FAVORITES_PAGE_LOADED:
      return {
        ...state,
        pager: action.pager,
        articles: action.payload[1].articles,
        articlesCount: action.payload[1].articlesCount,
        currentPage: 0
      };

    /**
     * Unloads the profile page or profile favorites page.
     * @returns {Object} An empty state, resetting the profile data.
     */
    case PROFILE_PAGE_UNLOADED:
    case PROFILE_FAVORITES_PAGE_UNLOADED:
      return {};
    default:
      return state;
  }
};
