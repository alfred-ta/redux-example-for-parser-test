import {
  SETTINGS_SAVED,
  SETTINGS_PAGE_UNLOADED,
  ASYNC_START
} from '../constants.actionTypes';

export default (state = {}, action) => {
  switch (action.type) {

    /**
     * Handles saving of settings.
     * Updates the state with the result of the settings save operation.
     * @param {boolean} action.error - Indicates if there was an error during the save operation.
     * @param {Object} action.payload.errors - Contains error details if the save operation failed.
     * @returns {Object} The updated state with `inProgress` set to false and possible errors.
     */
    case SETTINGS_SAVED:
      return {
        ...state,
        inProgress: false,
        errors: action.error ? action.payload.errors : null
      };

    /**
     * Handles unloading of the settings page.
     * Resets the state to an empty object, clearing any settings data.
     * @returns {Object} An empty state.
     */
    case SETTINGS_PAGE_UNLOADED:
      return {};

    /**
     * Handles the start of an asynchronous operation.
     * Sets the `inProgress` flag to true to indicate that a process is ongoing.
     * @returns {Object} The updated state with `inProgress` set to true.
     */
    case ASYNC_START:
      return {
        ...state,
        inProgress: true
      };
  }
};
