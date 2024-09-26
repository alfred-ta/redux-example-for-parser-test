import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const mapStateToProps = state => {
  return {
    pluginList: state.extensibility.instancesList.filter(({location}) => location ==='header')
  }};


const mapDispatchToProps = dispatch => {
  return {
    pushCallbackRequest: payload => dispatch({ type: 'PUSH_CALLBACK_REQUEST', payload }),
  };
}
  
const LoggedOutViewComponent = props => {
  const { pluginList, pushCallbackRequest } = props;

  const onSendCallbackRequest = (plugin) => {
    pushCallbackRequest({ ...plugin, callbackId: plugin.onClick });
  }

  if (!props.currentUser) {
    return (
      <ul className="nav navbar-nav pull-xs-right">
        {
          pluginList && pluginList.map((plugin) => (
            <li className="nav-item" key={plugin.extensionId}>
              {
                plugin.onClick ? 
                  <a onClick={() => onSendCallbackRequest(plugin)} className="nav-link">
                    {plugin.label}
                  </a>
                :
                  <Link to={`/plugin/${plugin.name}`} className="nav-link">
                    {plugin.label}
                  </Link>
              }
            </li>
          ))
        }
        <li className="nav-item">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Sign in
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/register" className="nav-link">
            Sign up
          </Link>
        </li>

      </ul>
    );
  }
  return null;
};

const LoggedOutView = connect(mapStateToProps, mapDispatchToProps)(LoggedOutViewComponent);

const LoggedInView = props => {
  if (props.currentUser) {
    return (
      <ul className="nav navbar-nav pull-xs-right">

        <li className="nav-item">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/editor" className="nav-link">
            <i className="ion-compose"></i>&nbsp;New Post
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/settings" className="nav-link">
            <i className="ion-gear-a"></i>&nbsp;Settings
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to={`/@${props.currentUser.username}`}
            className="nav-link">
            <img src={props.currentUser.image} className="user-pic" alt={props.currentUser.username} />
            {props.currentUser.username}
          </Link>
        </li>

      </ul>
    );
  }

  return null;
};

class Header extends React.Component {
  render() {
    return (
      <nav className="navbar navbar-light">
        <div className="container">

          <Link to="/" className="navbar-brand">
            {this.props.appName.toLowerCase()}
          </Link>

          <LoggedOutView currentUser={this.props.currentUser} />

          <LoggedInView currentUser={this.props.currentUser} />
        </div>
      </nav>
    );
  }
}

export default Header;
