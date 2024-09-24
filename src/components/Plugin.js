import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { isAbsoluteURL } from '../helper';

const PluginPage = ({ plugins, match }) => {
  const [currentPlugin, setCurrentPlugin] = useState(null);
  const slug = match.params.slug;
  const iframeRef = useRef(null);


  useEffect(() => {
    if (plugins && slug) {
      const plugin = plugins.find(p => p.name === slug);
      setCurrentPlugin(plugin)
    }
  }, [plugins, slug]);

  const pluginURL = useMemo(() => {
    if (!currentPlugin) return '';
    let { siteSrc, component: componentPath, pickerURL } = currentPlugin;
    if (pickerURL) return pickerURL; // Picker

    if (currentPlugin.param && currentPlugin.param.component) componentPath = currentPlugin.param.component;

    if (componentPath) {
      if (isAbsoluteURL(componentPath)) return componentPath + window.location.search;
      else {
        if (siteSrc.endsWith('/')) siteSrc = siteSrc.slice(0, -1);
        if (componentPath.startsWith('/')) componentPath = componentPath.slice(1);
        return `${siteSrc}/${componentPath}${window.location.search}`;
      }
    }
    return '';
  }, [currentPlugin]);

  const sandbox = useMemo(() => {
    if (currentPlugin && currentPlugin.sandboxPermissions && currentPlugin.sandboxPermissions.length > 0) {
      return currentPlugin.sandboxPermissions.join(' ');
    }
    return 'allow-scripts allow-presentation allow-forms allow-same-origin';
  }, [currentPlugin]);

  const connectApp = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CONNECT',
        src: currentPlugin.siteSrc,
        pluginId: currentPlugin.pluginId,
        extensionId: currentPlugin.extensionId,
        initialArgs: {
          param: currentPlugin.param,
        },
      }, '*');
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', connectApp);
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', connectApp);
      }
    };
  }, [connectApp]);

  
  return (
    <div className="container page">
      {
        !currentPlugin ?
          <h3>Plugin Page</h3>
        :
          <div>
            <h3>{currentPlugin.label}</h3>
            <iframe
              ref={iframeRef}
              src={pluginURL}
              title="e11y-plugin"
              className="plugin-wrapper"
              width={currentPlugin.width || '100%'}
              height={currentPlugin.height || '100%'}
              id={currentPlugin.extensionId}
              sandbox={sandbox}
              style={{ minHeight: 500 }}
            />
          </div>
      }
    </div>
  );  
};

const mapStateToProps = (state) => ({
  plugins: state.extensibility.instancesList,
});


export default connect(mapStateToProps, null)(PluginPage);
