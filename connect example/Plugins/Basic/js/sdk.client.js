'use strict';
window.reduxSDK = (() => {
  const CONNECTED_EV = new Event('connected');
  let initialData = {};
  const callbacks = {};
  const uuidv4 = () => {
    let d = new Date().getTime();
    let d2 = (performance && performance.now && performance.now() * 1000) || 0;

    return 'xxxxxxxx-xxxx-rxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };
  
  const addToCallbacks = callbackFunc => {
    const id = uuidv4();
    callbacks[id] = callbackFunc;
    return id;
  };

  let extensionId;
  let siteSrc;

  // ----------------------------------------------------------------
  // Wrapper INITIALIZATION
  // ----------------------------------------------------------------

  class RegisterWrapper {
    callFunc(endpoint, ...args) {
      args[0].siteSrc = siteSrc;

      if (args[0].onClick) {
        //Save in callback array function which should be called after function response received
        args[0].onClick = addToCallbacks(args[0].onClick);
      }

      //Set extensions id to avoid name collisions
      args[0].extensionId = extensionId;
      args[0].sdkId = uuidv4();
      return sendRegister(endpoint, ...args);
    }
  }

  class PickerWrapper {
    callFunc(endpoint, ...args) {
      // Set extensionId property on the first argument if it's an object
      if (!args || args.length < 1 || typeof args[0] !== 'object') 
        return sendPickerRequest(endpoint, { extensionId });
      args[0].extensionId = extensionId;
      args[0].sdkId = uuidv4();
      return sendPickerRequest(endpoint, ...args);
    }
  }
  
  

  // ----------------------------------------------------------------
  // Core Communication messages
  // ----------------------------------------------------------------
  // Receive
  var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  var eventer = window[eventMethod];
  var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';

  eventer(messageEvent, function(e) {
    let payload = e.data?.payload || e.data;
    if (payload.type === 'CONNECT' && !extensionId) {	
      initialize(payload);	
      return;	
    }

    if (payload.type == 'CALLBACK') {
      const func = callbacks[payload.callbackId];

      if (func) {
        if (payload.options) {
          func(payload.options);
        } else {
          func();
        }
      }
    }
  });
  
  const initialize = (options) => {
    const { src, extensionId: contextId, initialArgs } = options;
    extensionId = contextId;
    siteSrc = src;
    initialData = initialArgs
    window.dispatchEvent(CONNECTED_EV);
  }

  // Send
  const send = (keyName, kind, ...args) => {
    const sdkId = uuidv4();
    window.top.postMessage({ args: [...args], action: keyName, kind, extensionId, sdkId }, '*');
  }

  // Send async operations
  const sendAsync = (kind, ...args) => 
    new Promise((resolve, reject) => {
      // Get the result from parent and resolve to the caller.
      const onIFrameMessageReceived = (event) => {
        const dataToCheck = event.data;
        const hasSameMethod = dataToCheck.type === kind;
        const hasSameId = dataToCheck.id === id;

        if (hasSameMethod && hasSameId) {
          resolve(dataToCheck.result);
          window.removeEventListener('message', onIFrameMessageReceived);
        }
      }
      
      const id = uuidv4();
      const sdkId = uuidv4();
      const payloadArgs = args.length ? args : null;
      const payload = { id, kind, args: payloadArgs, extensionId, sdkId };
      try {
        window.top.postMessage(payload, '*');
        window.addEventListener('message', onIFrameMessageReceived);
      } catch (error) {
        reject(error);
      }      
      
    });

  // Specific senders
  const sendMutation = (keyName, ...args) => {
    send(keyName, 'mutation', ...args);
  }

  const sendAction = (keyName, ...args) => {
    send(keyName, 'action', ...args);
  }

  const sendGetter = (keyName, callbackFunc, args) => {
    const sdkId = uuidv4();
    const callbackId = addToCallbacks(callbackFunc);
    window.top.postMessage({ args, action: keyName, kind: 'getter', extensionId, callbackId, sdkId }, '*');
  }

  const sendRegister = (keyName, ...args) => {
    send(keyName, 'register', ...args);
  }

  const sendPickerRequest = (kind, ...args) => {
    send(kind, "picker", ...args);
  };

  // ----------------------------------------------------------------
  // INITIALIZATION - Extension
  // ----------------------------------------------------------------
  const isReady = () => {
    const states = ['complete', 'interactive', 'loaded'];

    return !!states.find(state => document.readyState === state);
  };

  const onReady = initExtension => {
    if (isReady() && extensionId) {
      initExtension(initialData);
      return;
    }

    window.addEventListener('connected', () => initExtension(initialData));
  };

  
  const regWrapper = new RegisterWrapper(sendRegister);
  const pickerWrapper = new PickerWrapper(sendPickerRequest);
  
  const api = {
    // GENERATED STUB START
    actions: {"article":{"ARTICLE_PAGE_LOADED":(...args) => {
  sendAction("article/ARTICLE_PAGE_LOADED", ...args);
},"ARTICLE_PAGE_UNLOADED":(...args) => {
  sendAction("article/ARTICLE_PAGE_UNLOADED", ...args);
},"ADD_COMMENT":(...args) => {
  sendAction("article/ADD_COMMENT", ...args);
},"DELETE_COMMENT":(...args) => {
  sendAction("article/DELETE_COMMENT", ...args);
}},"articleList":{"ARTICLE_FAVORITED":(...args) => {
  sendAction("articleList/ARTICLE_FAVORITED", ...args);
},"ARTICLE_UNFAVORITED":(...args) => {
  sendAction("articleList/ARTICLE_UNFAVORITED", ...args);
},"SET_PAGE":(...args) => {
  sendAction("articleList/SET_PAGE", ...args);
},"APPLY_TAG_FILTER":(...args) => {
  sendAction("articleList/APPLY_TAG_FILTER", ...args);
},"HOME_PAGE_LOADED":(...args) => {
  sendAction("articleList/HOME_PAGE_LOADED", ...args);
},"HOME_PAGE_UNLOADED":(...args) => {
  sendAction("articleList/HOME_PAGE_UNLOADED", ...args);
},"CHANGE_TAB":(...args) => {
  sendAction("articleList/CHANGE_TAB", ...args);
},"PROFILE_PAGE_LOADED":(...args) => {
  sendAction("articleList/PROFILE_PAGE_LOADED", ...args);
},"PROFILE_FAVORITES_PAGE_LOADED":(...args) => {
  sendAction("articleList/PROFILE_FAVORITES_PAGE_LOADED", ...args);
},"PROFILE_PAGE_UNLOADED":(...args) => {
  sendAction("articleList/PROFILE_PAGE_UNLOADED", ...args);
},"PROFILE_FAVORITES_PAGE_UNLOADED":(...args) => {
  sendAction("articleList/PROFILE_FAVORITES_PAGE_UNLOADED", ...args);
}},"auth":{"LOGIN":(...args) => {
  sendAction("auth/LOGIN", ...args);
},"REGISTER":(...args) => {
  sendAction("auth/REGISTER", ...args);
},"LOGIN_PAGE_UNLOADED":(...args) => {
  sendAction("auth/LOGIN_PAGE_UNLOADED", ...args);
},"REGISTER_PAGE_UNLOADED":(...args) => {
  sendAction("auth/REGISTER_PAGE_UNLOADED", ...args);
},"ASYNC_START":(...args) => {
  sendAction("auth/ASYNC_START", ...args);
},"UPDATE_FIELD_AUTH":(...args) => {
  sendAction("auth/UPDATE_FIELD_AUTH", ...args);
}},"common":{"APP_LOAD":(...args) => {
  sendAction("common/APP_LOAD", ...args);
},"REDIRECT":(...args) => {
  sendAction("common/REDIRECT", ...args);
},"LOGOUT":(...args) => {
  sendAction("common/LOGOUT", ...args);
},"ARTICLE_SUBMITTED":(...args) => {
  sendAction("common/ARTICLE_SUBMITTED", ...args);
},"SETTINGS_SAVED":(...args) => {
  sendAction("common/SETTINGS_SAVED", ...args);
},"LOGIN":(...args) => {
  sendAction("common/LOGIN", ...args);
},"REGISTER":(...args) => {
  sendAction("common/REGISTER", ...args);
},"DELETE_ARTICLE":(...args) => {
  sendAction("common/DELETE_ARTICLE", ...args);
},"ARTICLE_PAGE_UNLOADED":(...args) => {
  sendAction("common/ARTICLE_PAGE_UNLOADED", ...args);
},"EDITOR_PAGE_UNLOADED":(...args) => {
  sendAction("common/EDITOR_PAGE_UNLOADED", ...args);
},"HOME_PAGE_UNLOADED":(...args) => {
  sendAction("common/HOME_PAGE_UNLOADED", ...args);
},"PROFILE_PAGE_UNLOADED":(...args) => {
  sendAction("common/PROFILE_PAGE_UNLOADED", ...args);
},"PROFILE_FAVORITES_PAGE_UNLOADED":(...args) => {
  sendAction("common/PROFILE_FAVORITES_PAGE_UNLOADED", ...args);
},"SETTINGS_PAGE_UNLOADED":(...args) => {
  sendAction("common/SETTINGS_PAGE_UNLOADED", ...args);
},"LOGIN_PAGE_UNLOADED":(...args) => {
  sendAction("common/LOGIN_PAGE_UNLOADED", ...args);
},"REGISTER_PAGE_UNLOADED":(...args) => {
  sendAction("common/REGISTER_PAGE_UNLOADED", ...args);
}},"editor":{"EDITOR_PAGE_LOADED":(...args) => {
  sendAction("editor/EDITOR_PAGE_LOADED", ...args);
},"EDITOR_PAGE_UNLOADED":(...args) => {
  sendAction("editor/EDITOR_PAGE_UNLOADED", ...args);
},"ARTICLE_SUBMITTED":(...args) => {
  sendAction("editor/ARTICLE_SUBMITTED", ...args);
},"ASYNC_START":(...args) => {
  sendAction("editor/ASYNC_START", ...args);
},"ADD_TAG":(...args) => {
  sendAction("editor/ADD_TAG", ...args);
},"REMOVE_TAG":(...args) => {
  sendAction("editor/REMOVE_TAG", ...args);
},"UPDATE_FIELD_EDITOR":(...args) => {
  sendAction("editor/UPDATE_FIELD_EDITOR", ...args);
}},"home":{"HOME_PAGE_LOADED":(...args) => {
  sendAction("home/HOME_PAGE_LOADED", ...args);
},"HOME_PAGE_UNLOADED":(...args) => {
  sendAction("home/HOME_PAGE_UNLOADED", ...args);
}},"profile":{"PROFILE_PAGE_LOADED":(...args) => {
  sendAction("profile/PROFILE_PAGE_LOADED", ...args);
},"PROFILE_PAGE_UNLOADED":(...args) => {
  sendAction("profile/PROFILE_PAGE_UNLOADED", ...args);
},"FOLLOW_USER":(...args) => {
  sendAction("profile/FOLLOW_USER", ...args);
},"UNFOLLOW_USER":(...args) => {
  sendAction("profile/UNFOLLOW_USER", ...args);
}},"settings":{"SETTINGS_SAVED":(...args) => {
  sendAction("settings/SETTINGS_SAVED", ...args);
},"SETTINGS_PAGE_UNLOADED":(...args) => {
  sendAction("settings/SETTINGS_PAGE_UNLOADED", ...args);
},"ASYNC_START":(...args) => {
  sendAction("settings/ASYNC_START", ...args);
}},"extensibility":{}},
  
    mutations: {"article":{},"articleList":{},"auth":{},"common":{},"editor":{},"home":{},"profile":{},"settings":{},"extensibility":{}}, 

    getters: {"article":{},"articleList":{},"auth":{},"common":{},"editor":{},"home":{},"profile":{},"settings":{},"extensibility":{}},
    // GENERATED STUB END
  };

  return {
    initialize,
    onReady,
    ...api,
    register: {
    "header": (...args) => regWrapper.callFunc("header", ...args)
},
    
    state: {
      get: (...args) => sendAsync('state.get', ...args),
      set: (...args) => sendAsync('state.set', ...args),
    }
  };
})();