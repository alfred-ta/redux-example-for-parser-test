export default (state = {}, action) => {
  switch (action.type) {
    /**
     * Register Plugin at the given extensibility points
     * Updates the state after registering plugin at the given extensibility points
     * Make sure not to have duplicate entry.
     * @param {Object} action.payload.plugin - Plugin to register.
     * @param {Object} action.payload.location - Location to register plugin into
     */
    case 'REGISTER_PLUGIN':
      const { location, plugin } = action.payload;
      if (!location || !plugin) return state;
      const plugins = state.list[location] || [];
      const newList = [...new Set([...plugins, plugin])];
      return {
        ...state,
        list: newList
      };

    /**
     * Handles RESET SDK State
     * Resets list to an empty list
     * @returns {Object} An empty state.
     */
    case 'RESET_SDK':
    default:
      return {
        list: []
      };
  }
};
