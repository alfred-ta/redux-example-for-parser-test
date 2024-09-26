import {
  APP_LOAD,
  REDIRECT,
  LOGOUT,
  ARTICLE_SUBMITTED,
  SETTINGS_SAVED,
  LOGIN,
  REGISTER,
  DELETE_ARTICLE,
  ARTICLE_PAGE_UNLOADED,
  EDITOR_PAGE_UNLOADED,
  HOME_PAGE_UNLOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
  SETTINGS_PAGE_UNLOADED,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED
} from '../constants/actionTypes';

const defaultState = {
  appName: 'Conduit',
  token: null,
  viewChangeCounter: 0
};

export default (state = defaultState, action) => {
  switch (action.type) {

    /**
     * Handles app load action.
     * @param {Object} action.payload.user - The current user data.
     * @param {string} action.token - The authentication token.
     * @returns {Object} The updated state with the app loaded and user data.
     */
    case APP_LOAD:
      return {
        ...state,
        token: action.token || null,
        appLoaded: true,
        currentUser: action.payload ? action.payload.user : null
      };

    /**
     * Handles redirect action.
     * @returns {Object} The updated state with redirectTo set to null.
     */
    case REDIRECT:
      return { ...state, redirectTo: null };

    /**
     * Handles logout action.
     * @returns {Object} The updated state with the user logged out, resetting token and currentUser.
     */
    case LOGOUT:
      return { ...state, redirectTo: '/', token: null, currentUser: null };

    /**
     * Handles article submission action.
     * @param {Object} action.payload.article.slug - The slug of the submitted article.
     * @returns {Object} The updated state with a redirect to the submitted article.
     */
    case ARTICLE_SUBMITTED:
      const redirectUrl = `/article/${action.payload.article.slug}`;
      return { ...state, redirectTo: redirectUrl };

    /**
     * Handles settings saved action.
     * @param {Object} action.payload.user - The updated user data after settings are saved.
     * @param {boolean} action.error - Indicates if there was an error during the request.
     * @returns {Object} The updated state with redirect and user data based on success or error.
     */
    case SETTINGS_SAVED:
      return {
        ...state,
        redirectTo: action.error ? null : '/',
        currentUser: action.error ? null : action.payload.user
      };

    /**
     * Handles login or register action.
     * @param {Object} action.payload.user - The logged-in or registered user data.
     * @param {string} action.payload.user.token - The authentication token.
     * @param {boolean} action.error - Indicates if there was an error during the request.
     * @returns {Object} The updated state with user and token data, and a redirect on success.
     */
    case LOGIN:
    case REGISTER:
      return {
        ...state,
        redirectTo: action.error ? null : '/',
        token: action.error ? null : action.payload.user.token,
        currentUser: action.error ? null : action.payload.user
      };

    /**
     * Handles article deletion action.
     * @returns {Object} The updated state with a redirect to the homepage after deletion.
     */
    case DELETE_ARTICLE:
      return { ...state, redirectTo: '/' };

    /**
     * Handles unloading various pages (article, editor, home, profile, etc.).
     * Increments the viewChangeCounter to trigger a re-render when the page is unloaded.
     * @returns {Object} The updated state with incremented viewChangeCounter.
     */
    case ARTICLE_PAGE_UNLOADED:
    case EDITOR_PAGE_UNLOADED:
    case HOME_PAGE_UNLOADED:
    case PROFILE_PAGE_UNLOADED:
    case PROFILE_FAVORITES_PAGE_UNLOADED:
    case SETTINGS_PAGE_UNLOADED:
    case LOGIN_PAGE_UNLOADED:
    case REGISTER_PAGE_UNLOADED:
    default:
      return { ...state, viewChangeCounter: state.viewChangeCounter + 1 };
  }
};
