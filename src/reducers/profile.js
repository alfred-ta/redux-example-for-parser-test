import {
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  FOLLOW_USER,
  UNFOLLOW_USER
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {

    /**
     * Handles loading of the profile page.
     * Replaces the state with the user's profile data.
     * @param {Object} action.payload[0].profile - The user's profile data.
     * @returns {Object} The updated state with profile information.
     */
    case PROFILE_PAGE_LOADED:
      return {
        ...action.payload[0].profile
      };

    /**
     * Handles unloading of the profile page.
     * Resets the state to an empty object, clearing profile data.
     * @returns {Object} An empty state.
     */
    case PROFILE_PAGE_UNLOADED:
      return {};

    /**
     * Handles follow or unfollow actions.
     * Updates the state with the profile information after the follow/unfollow action.
     * @param {Object} action.payload.profile - The updated profile data after follow/unfollow.
     * @returns {Object} The updated state with the new profile data.
     */
    case FOLLOW_USER:
    case UNFOLLOW_USER:
      return {
        ...action.payload.profile
      };

    default:
      return state;
  }
};
