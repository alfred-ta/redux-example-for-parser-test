import {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
  ADD_COMMENT,
  DELETE_COMMENT
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    
    /**
     * Handles loading the article page.
     * @param {Object} action.payload - The payload containing the article and comments.
     * @returns {Object} The updated state with article and comments.
     */
    case ARTICLE_PAGE_LOADED:
      return {
        ...state,
        article: action.payload[0].article,
        comments: action.payload[1].comments
      };
    
    /**
     * Handles unloading the article page.
     * @returns {Object} An empty state, resetting the article and comments.
     */
    case ARTICLE_PAGE_UNLOADED:
      return {};
    
    /**
     * Handles adding a new comment.
     * @param {Object} action.payload - The payload containing the comment.
     * @param {Object} action.error - Indicates if an error occurred during the comment submission.
     * @returns {Object} The updated state with the new comment added, or errors if any.
     */
    case ADD_COMMENT:
      return {
        ...state,
        commentErrors: action.error ? action.payload.errors : null,
        comments: action.error ?
          null :
          (state.comments || []).concat([action.payload.comment])
      };
    
    /**
     * Handles deleting an existing comment.
     * @param {string} action.commentId - The ID of the comment to be deleted.
     * @returns {Object} The updated state with the comment removed.
     */
    case DELETE_COMMENT:
      const commentId = action.commentId;
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== commentId)
      };
    default:
      return state;
  }
};
