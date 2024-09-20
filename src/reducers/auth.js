import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    
    /**
     * Handles the login or register action.
     * @param {boolean} action.error - Indicates if there was an error during the request.
     * @param {Object} action.payload.errors - Contains the errors, if any.
     * @returns {Object} The updated state with the login/register progress and errors.
     */
    case LOGIN:
    case REGISTER:
      return {
        ...state,
        inProgress: false,
        errors: action.error ? action.payload.errors : null
      };

    /**
     * Unloads the login or register page, resetting the state.
     * @returns {Object} An empty state.
     */
    case LOGIN_PAGE_UNLOADED:
    case REGISTER_PAGE_UNLOADED:
      return {};
    /**
     * Handles the asynchronous start for login or register actions.
     * @param {string} action.subtype - The subtype of the action (LOGIN or REGISTER).
     * @returns {Object} The updated state, indicating the request is in progress.
     */
    case ASYNC_START:
      if (action.subtype === LOGIN || action.subtype === REGISTER) {
        return { ...state, inProgress: true };
      }
      break;

    /**
     * Updates a specific authentication field.
     * @param {string} action.key - The key of the field to update.
     * @param {string} action.value - The new value for the field.
     * @returns {Object} The updated state with the modified field.
     */
    case UPDATE_FIELD_AUTH:
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }

  return state;
};
