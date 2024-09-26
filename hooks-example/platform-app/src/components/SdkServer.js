import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function safeJSONParse(paramString) {
  let param = {};
  try {
    if (paramString && paramString.length > 0) param = JSON.parse(paramString);
  } catch(error) {
    console.error('incompatible JSON string', error);
  }
  return param;
}


const SdkServerComponent = () => {
  const extensions = useSelector((state) => state.extensibility.extensions);
  const requestList = useSelector((state) => state.extensibility.requestList);
  const dispatch = useDispatch();

  const containerRef = useRef({});

  const registerPlugin = (payload) => dispatch({ type: 'REGISTER_PLUGIN', payload });
  const pullCallbackRequest = (payload) => dispatch({ type: 'PULL_CALLBACK_REQUEST', payload });
  const emitAction = (type, payload) => dispatch({ type, payload });

  useEffect(() => {
    const receiveMessage = async (event) => {
      if (event.data) {
        const { extensionId } = event.data;
        const extension = findExtension(event.origin, extensionId);

        if (extension) {
          switch (event.data.kind) {
            case 'action':
              const names = event.data.action.split('/');
              if (names && names.length > 1) {
                const [, actionName] = names;
                const [payload] = event.data.args || [];
                emitAction(actionName, payload);
              }
              break;
            case 'register':
              registerPlugin({ location: event.data.action, plugin: event.data.args[0] });
              break;
            case 'state.get':
              const storedData = JSON.parse(localStorage.getItem(extensionId) || '{}');
              event.source.postMessage(
                { type: 'state.get', id: event.data.id, result: storedData[event.data.args[0]] },
                event.origin
              );
              break;
            case 'state.set':
              const [key, value] = event.data.args;
              const newData = { ...JSON.parse(localStorage.getItem(extensionId) || '{}'), [key]: value };
              localStorage.setItem(extensionId, JSON.stringify(newData));
              break;
            default:
              console.log('Unhandled message:', event.data);
          }
        }
      }
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, []);

  useEffect(() => {
    if (requestList.length > 0) {
      requestList.forEach(sendMessage);
    }
  }, [requestList]);

  const findExtension = (eventOrigin, extensionId) => {
    return extensions.find((ext) => ext.url.includes(eventOrigin) && ext.id === extensionId);
  };

  const connectExtension = (extension) => {
    if (!containerRef.current[extension.id]) return;
    const iframeWindow = containerRef.current[extension.id].contentWindow;
    if (iframeWindow) {
      const param = safeJSONParse(extension.param);
      iframeWindow.postMessage(
        {
          type: 'CONNECT',
          src: extension.url,
          extensionId: extension.id,
          initialArgs: { param: { ...param, message: 'Welcome' } },
        },
        '*'
      );
    }
  };

  const sendMessage = (extension) => {
    const id = extension.extensionId;
    if (containerRef.current[id] && containerRef.current[id].contentWindow) {
      containerRef.current[id].contentWindow.postMessage(
        { type: 'CALLBACK', options: extension, callbackId: extension.callbackId },
        '*'
      );
    }
    pullCallbackRequest(extension);
  };

  return (
    <div className="sdk-server-iframe-container">
      {extensions && extensions.map((extension) => (
        <iframe
          key={extension.id}
          src={extension.url}
          title={`e11y-extension-${extension.id}`}
          style={{ border: 'none' }}
          id={extension.id}
          ref={(el) => (containerRef.current[extension.id] = el)}
          width="300"
          height="300"
          onLoad={() => connectExtension(extension)}
        />
      ))}
    </div>
  );
};

export default SdkServerComponent;
