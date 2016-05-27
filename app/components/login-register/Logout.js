/**
** Logout.js
**
** Composant de logout.
** Gère la partie logout de l'application
**
**/

import React, {Component} from 'react';
import {firebaseUtils} from '../../fb/users';
import {connect} from 'react-redux';

//Gère la vue de déconnexion. Redirige vers l'acceuil.
export class Logout extends Component{
  componentDidMount() {
    firebaseUtils.logout();
    this.props.dispatch({
      type: 'LOGOUT'
    });
    //Redirection après 1,5 secondes.
    setTimeout(()=>this.context.router.replace('/'),1500);
  }
  render() {
    return (
      //Affiche un message pour informer la redirection après logout.
      <div className="grid grid-pad">
        <p style={{marginTop:"64px", textAlign:"center"}}>Vous êtes déconnecté et allez être redirigé vers l'accueil</p>
      </div>);
    }
  }
  Logout.contextTypes = {
    router: React.PropTypes.object.isRequired
  }
export default connect()(Logout)
