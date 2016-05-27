/*
** Mise en palce des routes avec react-router
** https://github.com/reactjs/react-router
*/

import React, {Component} from 'react';
import {Router, Route, hashHistory, IndexRoute} from 'react-router';
import Main from '../containers/main/Main';
import Register from '../components/login-register/Register';
import Login from "../components/login-register/Login";
import Logout from '../components/login-register/Logout';
import Dashboard from '../containers/secure/dashboard/Dashboard';
import Home from "../components/home/Home";
import Panel from '../components/secure/Panel';
import Calendar from '../components/secure/Calendar';
import Members from '../components/secure/Members';
import Groups from '../components/secure/Groups';
import Settings from '../components/secure/Settings';
import {requireAuth} from '../fb/authenticated';

//Exporation des Routes à intégrer dans App.js
export let routes = (
  <Router history={hashHistory}>
    <Route path='/' component={Main}>
      <IndexRoute component={Home} />
      <Route path="login" component={Login} />
      <Route path="logout" component={Logout} />
      <Route path="register" component={Register} />
      <Route path="dashboard" component={Dashboard} onEnter={requireAuth}>
        <IndexRoute component={Panel}/>
        <Route path="members" component={Members}/>
        <Route path="groups" component={Groups}/>
        <Route path="calendar" component={Calendar}/>
        <Route path="settings" component={Settings}/>
      </Route>
    </Route>
  </Router>
);
