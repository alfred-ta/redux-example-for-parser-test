import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { safeJSONParse, initParse, authorize } from '@/utils/common';

const SdkServer = () => {
  const [extensionPoints, setExtensionPoints] = useState({});
  const containerRef = useRef({});

  const dispatch = useDispatch();

  // Using selectors to map state from Redux store
  const user = useSelector((state) => state.user.current);
  const activeSite = useSelector((state) => state.sites.active);
  const userInstalledApps = useSelector((state) => state.publisher.userInstalledApps || []);
  const siteInstalledApps = useSelector((state) => state.publisher.siteInstalledApps || []);
  const SDKRoles = useSelector((state) => state.publisher.SDKRoles);

  const extensions = activeSite
    ? [...userInstalledApps, ...siteInstalledApps]
    : userInstalledApps;

  useEffect(() => {
    const receiveMessage = async (event) => {
      if (event.data) {
        const { extensionId, sdkId } = event.data;
        const extension = findExtension(event.origin, extensionId);

        if (extension) {
          const permission = getPermissionFromSdkId(sdkId);

          if (!permission || isValidRequest(permission, event.data.kind, event.data.action) === false) return;

          switch (event.data.kind) {
            case 'action':
              dispatch({ type: event.data.action, payload: event.data.args || [] });
              break;
            case 'mutation':
              dispatch({ type: event.data.action, payload: event.data.args || [] });
              break;
            case 'getter':
              const getterResult = event.data.args
                ? useSelector((state) => state[event.data.action](...event.data.args))
                : useSelector((state) => state[event.data.action]);

              event.source.postMessage(
                { type: 'CALLBACK', options: getterResult, callbackId: event.data.callbackId },
                event.origin
              );
              break;
            case 'register':
              const arg = safeJSONParse(extension.param);
              const updatedExtensionPoints = {
                ...extensionPoints,
                [event.data.action]: [
                  ...(extensionPoints[event.data.action] || []),
                  { ...arg, extensionId },
                ],
              };
              setExtensionPoints(updatedExtensionPoints);
              break;
            case 'state.get':
              const storedData = JSON.parse(localStorage.getItem(extensionId) || '{}');
              event.source.postMessage(
                { type: 'state.get', callbackId: event.data.callbackId, result: storedData[event.data.args[0]] },
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
  }, [extensionPoints, dispatch]);


  const findExtension = (eventOrigin, extensionId) => {
    return extensions.find((ext) => ext.developerApp.url.includes(eventOrigin) && ext.id === extensionId);
  };

  const getPermissionFromSdkId = (sdkId) => {
    // Mockup of SDK role validation
    const role = SDKRoles.find((r) => r.securityPrefix === sdkId);
    return role ? safeJSONParse(role.content) : null;
  };

  const isValidRequest = (permission, kind, action) => {
    if (!permission) return false;
    if (kind === 'state.get') return permission.state?.includes('get');
    if (kind === 'state.set') return permission.state?.includes('set');
    return permission[kind]?.includes(action);
  };

  const connectExtension = (extension) => {
    const iframeWindow = containerRef.current[extension.id]?.contentWindow;
    if (iframeWindow) {
      const param = safeJSONParse(extension.param);
      iframeWindow.postMessage(
        {
          type: 'CONNECT',
          extensionId: extension.id,
          initialArgs: { currentUser: user, activeSite, param },
        },
        '*'
      );
    }
  };

  return (
    <div className="sdk-server-iframe-container">
      {extensions.map((extension) => (
        <iframe
          key={extension.id}
          src={extension.developerApp.url}
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

export default SdkServer;
