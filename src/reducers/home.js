import { HOME_PAGE_LOADED, HOME_PAGE_UNLOADED } from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {

    /**
     * Handles loading of the home page.
     * Populates the state with tags fetched from the server.
     * @param {Object[]} action.payload - The payload containing an array where the first element includes tags.
     * @param {string[]} action.payload[0].tags - The list of tags.
     * @returns {Object} The updated state with tags.
     */
    case HOME_PAGE_LOADED:
      return {
        ...state,
        tags: action.payload[0].tags
      };

    /**
     * Handles unloading of the home page.
     * Resets the state to an empty object.
     * @returns {Object} An empty state.
     */
    case HOME_PAGE_UNLOADED:
      return {};
  }
};
