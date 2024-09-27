import React from 'react';
import { useSelector,useDispatch } from 'react-redux';

const ExtensionPoints = () => {
    //Get counter from counterReducer
    const pluginList = useSelector(state => state.extensibility.instancesList.filter(({location}) => location ==='header'));
  
    //Use for all the dispatch actions
    const dispatch = useDispatch();
    
    const pushCallbackRequest = (payload) => dispatch({ type: 'PUSH_CALLBACK_REQUEST', payload })

  
    const onSendCallbackRequest = (plugin) => {
        pushCallbackRequest({ ...plugin, callbackId: plugin.onClick });
    }

    return (         
        <section id="section-extension">
        <h3 className="center-align white-text blue">Extension Points</h3>
        <ul className="row counter-btns">
        {
          pluginList && pluginList.map((plugin) => (
            <li className="nav-item" key={plugin.extensionId}>
              <button className="btn blue" onClick={() => onSendCallbackRequest(plugin)}>
                {plugin.label}
              </button>
            </li>
          ))
        }
        </ul>
        </section>
    );
}
 
export default ExtensionPoints;