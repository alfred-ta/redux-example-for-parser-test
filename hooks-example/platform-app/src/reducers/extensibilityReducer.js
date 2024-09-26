const initialState = {
  instancesList: [],
  requestList: [],
  extensions: [
    {
      id: 'basic-example',
      // url: 'https://basic-redux-embed.getforge.io/',
      url: 'http://localhost:8000/',
    }
  ]
};
export default (state = initialState, action) => {
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
      const newInstance = {...plugin, location};
      const plugins = state.instancesList || [];
      const newList = [...new Set([...plugins, newInstance])];
      return {
        ...state,
        instancesList: newList
      };

    case 'PUSH_CALLBACK_REQUEST':
      if (!action.payload.callbackId) return state;
      return {
        ...state,
        requestList: [...new Set([...state.requestList, action.payload])]
      };

    case 'PULL_CALLBACK_REQUEST':
      if (!action.payload.callbackId) return state;
      const requestList = state.requestList.filter(extension => extension.callbackId !== action.payload.callbackId)
      return {
        ...state,
        requestList
      };
  

    /**
     * Handles RESET SDK State
     * Resets list to an empty list
     * @returns {Object} An empty state.
     */
    case 'RESET_SDK':
      return initialState;
    default:
      return state;
  }
};
