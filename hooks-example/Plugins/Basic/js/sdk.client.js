'use strict';
window.hooksReduxSDK = (() => {
  const CONNECTED_EV = new Event('connected');
  let initialData = {};
  const callbacks = {};
  const uuidv4 = () => {
    let d = new Date().getTime();
    let d2 = (performance && performance.now && performance.now() * 1000) || 0;

    return 'xxxxxxxx-xxxx-hxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
        const dataToCheck = event.data.data;
        const hasSameMethod = dataToCheck.kind === kind;
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
    actions: {"characters":{"CHANGE_NAME":(...args) => {
  sendAction("characters/CHANGE_NAME", ...args);
},"CHANGE_OCCUPATION":(...args) => {
  sendAction("characters/CHANGE_OCCUPATION", ...args);
},"CHANGE_AGE":(...args) => {
  sendAction("characters/CHANGE_AGE", ...args);
}},"myCounter":{"INCREMENT_COUNT":(...args) => {
  sendAction("myCounter/INCREMENT_COUNT", ...args);
},"INCREMENT_COUNT_TEN":(...args) => {
  sendAction("myCounter/INCREMENT_COUNT_TEN", ...args);
},"DOUBLE_COUNT":(...args) => {
  sendAction("myCounter/DOUBLE_COUNT", ...args);
},"DECREMENT_COUNT_TEN":(...args) => {
  sendAction("myCounter/DECREMENT_COUNT_TEN", ...args);
},"DECREMENT_COUNT":(...args) => {
  sendAction("myCounter/DECREMENT_COUNT", ...args);
},"RESET_COUNT":(...args) => {
  sendAction("myCounter/RESET_COUNT", ...args);
}},"todos":{"ADD_TODO":(...args) => {
  sendAction("todos/ADD_TODO", ...args);
},"REMOVE_TODO":(...args) => {
  sendAction("todos/REMOVE_TODO", ...args);
}}},
  
    mutations: {"characters":{},"myCounter":{},"todos":{}}, 

    getters: {"characters":{},"myCounter":{},"todos":{}},
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