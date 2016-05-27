/**
** Home.js
**
** Composant de la page d'accueil.
** Présentation de l'outil, liens vers inscription et connexion (ou profil et deconnexion si on est authentifié)
**
**/

//Utilisation des composants de Material-UI "material-ui.com"
import React, {Component} from "react";
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardMedia, CardTitle} from 'material-ui/Card';
//Importation du CSS pour Home
import './Home.css';

export default class Home extends Component{
  render() {
    return (
      <div>
        <div id="index-banner">
          <div className="grid">
            <div className="col-1-3 push-1-3">
              <h3 className="header">Gérer les adhérents de votre association<br/> de manière <b>simple</b> et en <b>temps réel</b></h3>
            </div>
            <div className="grid">
              <div className="col-1-3 push-1-3">
                <RaisedButton href="#/register" linkButton={true} primary={true} label="Commencer"/>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-pad">
          <div className="col-1-3">
            <Card>
              <CardMedia
                overlay={<CardTitle title="Expérience utilisateur" subtitle="Nous vous offrons une expérience utilsateur hors du commun !" />}
                >
                <img src={require('../../assets/img/1.jpg')} />
              </CardMedia>
            </Card>
          </div>

          <div className="col-1-3">
            <Card>
              <CardMedia
                overlay={<CardTitle title="Stockage d'informations" subtitle="Faites confiance à GDA pour protéger vos données !" />}
                >
                <img src={require('../../assets/img/2.jpg')} />
              </CardMedia>
            </Card>
          </div>

          <div className="col-1-3">
            <Card>
              <CardMedia
                overlay={<CardTitle title="Intuitif" subtitle="Notre outil a été créé dans l'objectif d'être abordable par tous !" />}
                >
                <img src={require('../../assets/img/3.jpg')} />
              </CardMedia>
            </Card>
          </div>
        </div>

      </div>
    );
  }
};
