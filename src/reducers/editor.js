import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {

    /**
     * Handles loading of the editor page.
     * Populates the state with the article's details if available.
     * @param {Object} action.payload.article - The article data (slug, title, description, body, tagList).
     * @returns {Object} The updated state with the article data.
     */
    case EDITOR_PAGE_LOADED:
      return {
        ...state,
        articleSlug: action.payload ? action.payload.article.slug : '',
        title: action.payload ? action.payload.article.title : '',
        description: action.payload ? action.payload.article.description : '',
        body: action.payload ? action.payload.article.body : '',
        tagInput: '',
        tagList: action.payload ? action.payload.article.tagList : []
      };

    /**
     * Handles unloading of the editor page.
     * Resets the state to an empty object.
     * @returns {Object} An empty state.
     */
    case EDITOR_PAGE_UNLOADED:
      return {};

    /**
     * Handles submission of an article.
     * Sets inProgress to null and records any errors that occurred during submission.
     * @param {Object} action.payload.errors - The errors, if any.
     * @param {boolean} action.error - Indicates if there was an error during the request.
     * @returns {Object} The updated state with inProgress status and errors.
     */
    case ARTICLE_SUBMITTED:
      return {
        ...state,
        inProgress: null,
        errors: action.error ? action.payload.errors : null
      };

    /**
     * Handles the start of an asynchronous operation.
     * If the operation subtype is related to article submission, sets inProgress to true.
     * @param {string} action.subtype - The subtype of the async operation (e.g., ARTICLE_SUBMITTED).
     * @returns {Object} The updated state with inProgress set to true.
     */
    case ASYNC_START:
      if (action.subtype === ARTICLE_SUBMITTED) {
        return { ...state, inProgress: true };
      }
      break;

    /**
     * Handles adding a tag.
     * Adds the tag from the tagInput field to the tagList.
     * Resets the tagInput to an empty string.
     * @returns {Object} The updated state with the new tagList and cleared tagInput.
     */
    case ADD_TAG:
      return {
        ...state,
        tagList: state.tagList.concat([state.tagInput]),
        tagInput: ''
      };

    /**
     * Handles removing a tag.
     * Removes the specified tag from the tagList.
     * @param {string} action.tag - The tag to be removed.
     * @returns {Object} The updated state with the tag removed from the tagList.
     */
    case REMOVE_TAG:
      return {
        ...state,
        tagList: state.tagList.filter(tag => tag !== action.tag)
      };

    /**
     * Updates a specific field in the editor.
     * @param {string} action.key - The field key to be updated (e.g., title, description).
     * @param {string} action.value - The new value for the field.
     * @returns {Object} The updated state with the modified field.
     */
    case UPDATE_FIELD_EDITOR:
      return { ...state, [action.key]: action.value };
  }

  return state;
};
