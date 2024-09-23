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
      const plugins = state.instancesList[location] || [];
      const newList = [...new Set([...plugins, plugin])];
      return {
        ...state,
        instancesList: newList
      };

    /**
     * Handles RESET SDK State
     * Resets list to an empty list
     * @returns {Object} An empty state.
     */
    case 'RESET_SDK':
    default:
      return {
        instancesList: [],
        extensions: [
          {
            id: 'basic-example',
            url: 'http://localhost:8000',
            id: 'redux_bd39ef89-7ccb-4ec7-ae6f-2398a3d532a8'
          }
        ]
      };
  }
};
