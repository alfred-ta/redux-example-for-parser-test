import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ApplicationState } from "../store";

interface Extension {
  id: string;
  url: string;
  param?: string;
}

interface Request {
  extensionId: string;
  callbackId: string;
}

interface EventData {
  extensionId: string;
  kind: string;
  action: string;
  args?: any[];
  id?: string;
  callbackId?: string;
}

function safeJSONParse(paramString: string): any {
  let param = {};
  try {
    if (paramString && paramString.length > 0) param = JSON.parse(paramString);
  } catch (error) {
    console.error('incompatible JSON string', error);
  }
  return param;
}

const SdkServerComponent: React.FC = () => {
  const extensions = useSelector((state: ApplicationState) => state.extensibility.extensions) as Extension[];
  const requestList = useSelector((state: ApplicationState) => state.extensibility.requestList) as Request[];
  const dispatch = useDispatch();
  const containerRef = useRef<Record<string, HTMLIFrameElement | null>>({});

  const registerPlugin = (payload: any) => dispatch({ type: 'REGISTER_PLUGIN', payload });
  const pullCallbackRequest = (payload: any) => dispatch({ type: 'PULL_CALLBACK_REQUEST', payload });
  const emitAction = (type: string, payload: any) => dispatch({ type, payload });

  useEffect(() => {
    const receiveMessage = async (event: MessageEvent) => {
      if (event.data) {
        const { extensionId } = event.data as EventData;
        const extension = findExtension(event.origin, extensionId);

        if (extension) {
          switch (event.data.kind) {
            case 'action': {
              const names = event.data.action.split('/');
              if (names && names.length > 1) {
                const [, actionName] = names;
                const [payload] = event.data.args || [];
                emitAction(actionName, payload);
              }
              break;
            }
            case 'register':
              registerPlugin({ location: event.data.action, plugin: event.data.args?.[0] });
              break;
            case 'state.get': {
              const storedData = JSON.parse(localStorage.getItem(extensionId) || '{}');
              event.source?.postMessage(
                { type: 'state.get', id: event.data.id, result: storedData[event.data.args?.[0]] },
                event.origin
              );
              break;
            }
            case 'state.set': {
              const [key, value] = event.data.args || [];
              const newData = { ...JSON.parse(localStorage.getItem(extensionId) || '{}'), [key]: value };
              localStorage.setItem(extensionId, JSON.stringify(newData));
              break;
            }
            default:
              console.log('Unhandled message:', event.data);
          }
        }
      }
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, [extensions]);

  useEffect(() => {
    if (requestList.length > 0) {
      requestList.forEach(sendMessage);
    }
  }, [requestList]);

  const findExtension = (eventOrigin: string, extensionId: string) => {
    return extensions.find((ext) => ext.url.includes(eventOrigin) && ext.id === extensionId);
  };

  const connectExtension = (extension: Extension) => {
    const iframe = containerRef.current[extension.id];
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      const param = safeJSONParse(extension.param || '{}');
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

  const sendMessage = (extension: Request) => {
    const iframe = containerRef.current[extension.extensionId];
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: 'CALLBACK', options: extension, callbackId: extension.callbackId },
        '*'
      );
    }
    pullCallbackRequest(extension);
  };

  return (
    <div className="sdk-server-iframe-container">
      {extensions &&
        extensions.map((extension) => (
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
