import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { safeJSONParse } from '../../helper';

const mapStateToProps = state => {
  return {
    extensions: state.extensibility.extensions,
    requestList: state.extensibility.requestList
  }
};

const mapDispatchToProps = dispatch => {
  return {
    registerPlugin: payload => dispatch({ type: 'REGISTER_PLUGIN', payload }),
    pullCallbackRequest: payload => dispatch({ type: 'PULL_CALLBACK_REQUEST', payload }),
    emitAction: (type, payload) => dispatch({ type, payload })
  };
}

const SdkServerComponent = (props) => {
  const { extensions, requestList } = props;
  const { registerPlugin, pullCallbackRequest, emitAction } = props;
  const containerRef = useRef({});

  useEffect(() => {
    const receiveMessage = async (event) => {
      if (event.data) {
        const { extensionId } = event.data;
        const extension = findExtension(event.origin, extensionId);

        if (extension) {
          console.log('found extension', extension)
          // Skip Permission check for now.
          // const permission = getPermissionFromSdkId(sdkId);

          // if (!permission || isValidRequest(permission, event.data.kind, event.data.action) === false) return;

          switch (event.data.kind) {
            case 'action':
              const names = event.data.action.split('/');
              // We need only ACTION_NAME from `{namespaceName}/{ACTION_NAME}`
              if (names && names.length > 1) {
                const [, actionName] = names;
                const [payload] = event.data.args || [];
                emitAction(actionName, payload);
              }
              break;
            // case 'getter':
            //   const getterResult = event.data.args
            //     ? useSelector((state) => state[event.data.action](...event.data.args))
            //     : useSelector((state) => state[event.data.action]);

            //   event.source.postMessage(
            //     { type: 'CALLBACK', options: getterResult, callbackId: event.data.callbackId },
            //     event.origin
            //   );
            //   break;
            case 'register':
              registerPlugin({ location: event.data.action, plugin: event.data.args[0] })
              break;
            // case 'state.get':
            //   const storedData = JSON.parse(localStorage.getItem(extensionId) || '{}');
            //   event.source.postMessage(
            //     { type: 'state.get', callbackId: event.data.callbackId, result: storedData[event.data.args[0]] },
            //     event.origin
            //   );
            //   break;
            // case 'state.set':
            //   const [key, value] = event.data.args;
            //   const newData = { ...JSON.parse(localStorage.getItem(extensionId) || '{}'), [key]: value };
            //   localStorage.setItem(extensionId, JSON.stringify(newData));
            //   break;
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
    if (extensions) // return extensions.find((ext) => ext.url.includes(eventOrigin) && ext.id === extensionId);
      return extensions.find((ext) => ext.id === extensionId);
    return null;
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
    if (containerRef.current[id] && containerRef.current[id].contentWindow) 
      containerRef.current[id].contentWindow.postMessage({ type: "CALLBACK", options: extension, callbackId: extension.callbackId }, '*');
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

const SdkServer = connect(mapStateToProps, mapDispatchToProps)(SdkServerComponent)

export default SdkServer;
