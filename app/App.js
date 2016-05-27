/*
** Composant général comprenant les routes, redux et firebase
** Ce composant fait le lien direct avec l'identifiant de l'index "app"
*/

import React from 'react';
import {render} from 'react-dom';
import {routes} from './config/routes';
import {Provider} from 'react-redux';
import {firebaseUtils} from './fb/users';
import store from './store';
import injectTapEventPlugin from 'react-tap-event-plugin';
//Importation du framework css simplegrid
import './assets/css/simplegrid.css';
injectTapEventPlugin();

render(
  <Provider store={store}>
    {routes}
  </Provider>
  , document.getElementById('app')
);
