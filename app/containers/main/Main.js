/*
** Second composant (après App.js) appelé lors du lancement de l'application
** Comprend le système de navigation en fonction de la connexion de l'utilsateur
** Il s'agit du composant parent principal
*/

import React, {Component} from 'react';
import {Router, Link} from 'react-router';
import {firebaseUtils} from '../../fb/users';
import AppBar from 'material-ui/AppBar';
import Leftnav from '../../components/secure/Leftnav'
import IconButton from 'material-ui/IconButton';
import {ToolbarGroup} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionHome from 'material-ui/svg-icons/action/home';
import PowerSettings from 'material-ui/svg-icons/action/power-settings-new';
import Face from 'material-ui/svg-icons/action/face';

export default class Main extends Component {
  //mise en place des propriétés initiales et des états
  constructor(props){
    super(props);
    this.state = {
      loggedIn: firebaseUtils.isLoggedIn()
    }
    this.handleLogout = this.handleLogout.bind(this);
  }
  handleLogout(loggedIn){
    this.setState({
      loggedIn: loggedIn
    });
  }
  //On récupère le thème de base de material-ui
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }
  componentWillMount(){
    firebaseUtils.onChange = this.handleLogout;
  }
  render(){
    let home;
    let loginOrOut;
    let register;
    let settings;

    const style = {
      menu:{
        paddingLeft:"4px",
        paddingRight:"4px",
        marginTop:"13px"
      },
      menuButton:{
        paddingLeft:"4px",
        paddingRight:"4px",
        marginTop:"13px",
        color:"#fff"
      }
    }
    //En fonction de l'état loggedIn, des éléments du ReactDOM diffèrent
    if(this.state.loggedIn){
      home = <Link to="/dashboard"> <FlatButton icon={<ActionHome/>} style={style.menuButton}/></Link>;
        loginOrOut = <Link to="/logout"><FlatButton icon={<PowerSettings/>} label="Déconnexion" style={style.menu} secondary={true}/></Link>;
          register = null;
          settings = <Link to="/dashboard/settings"><FlatButton icon={<Face/>} primary={true} label="Profil" style={style.menu}/></Link>;

          } else {
            home = <Link to="/"><FlatButton style={style.menu} primary={true} label="Accueil"/></Link>;
              loginOrOut = <Link to="/login"><FlatButton secondary={true} style={style.menu} label="Connexion"/></Link>;
                register = <Link to="/register"><FlatButton secondary={true} style={style.menu} label="Inscription"/></Link>;
                  settings = null;
                }

                return (
                  <span>
                    <AppBar
                      iconElementLeft={<img style={{marginLeft:"45px"}} height="45" src={require("../../assets/img/logo.png")}/>}
                      title="Assaucisson"
                      id="damion"
                      titleStyle={{color:"#fff",fontFamily:"Damion",textDecoration:"underline"}}
                      style={{position:"fixed", backgroundColor:"#424242"}}
                      showMenuIconButton={true}
                      >
                      {home}
                      {settings}
                      {register}
                      {loginOrOut}
                    </AppBar>
                    {this.props.children}
                  </span>
                );
              }
            }

            Main.childContextTypes = {
              muiTheme: React.PropTypes.object.isRequired
            }
            Main.contextTypes = {
              router: React.PropTypes.object.isRequired
            }
