/*
** Composant de la sideBar avec l'implémentation des liens vers les gestions (membres, groupes..)
*/

//Importation de Material-UI
import React, {Component} from 'react';
import LeftNav from 'material-ui/Drawer';
import Dashboard from 'material-ui/svg-icons/action/dashboard';
import Group from 'material-ui/svg-icons/social/group';
import Person from 'material-ui/svg-icons/social/person';
import DateRange from 'material-ui/svg-icons/action/date-range';
import {Card, CardHeader, CardMedia} from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';
import {firebaseUtils} from '../../fb/users';
import Dropzone from "react-dropzone"; //https://github.com/okonet/react-dropzone
//Utilisation de superagent pour effectuer des requêtes vers l'upload
var request = require('superagent');
//initialisation de Firebase pour l'association
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);

export default class Leftnav extends Component {
  //Mise en place des états et des propriétés initiales
  constructor(props) {
    super(props);
    this.state = {
      img:"card.jpg",
      id:""
    };
    this.loadBackGroundAndIdFromAssociation = this.loadBackGroundAndIdFromAssociation.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }
  //Chargement du background (logo) et l'id de l'association
  loadBackGroundAndIdFromAssociation() {
    let img = [];
    let id = [];
    ref.child(this.props.yourAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        id=snapshot.val().id;
        img=snapshot.val().img;
      });
      this.setState({
        img: img,
        id: id
      });
    });
  }
  //upload de l'image
  onDrop(file) {
    var photo = new FormData();
    photo.append('photo', file[0]);
    request.post('/upload')
    .send(photo)
    .end(function(err, resp) {
      if (err) { console.error(err); }
      return resp;
    });

    setTimeout(()=>{
      this.setState({img:file[0].name.toLowerCase()});
      ref.child(this.props.yourAssociation+"/"+this.state.id).update({img:file[0].name.toLowerCase()});
    },3000);
  }
  //Une fois chargé, le composant charge les nouvelles informations (logo et ID)
  componentDidMount(){
    this.loadBackGroundAndIdFromAssociation();
  }
  render(){
    let membres = this.props.you.admin ? "Gestion des adhérents" : "Consultation des adhérents";
    let groupes = this.props.you.admin ? "Gestion des groupes" : "Consultation des groupes";
    let admin = this.props.you.admin ? "Administrateur" : "Membre";
    //Connexion vers amazon S3
    const linkToS3 ="https://assaucisson.s3-us-west-2.amazonaws.com/";
    let avatar = this.props.you ? linkToS3+this.props.you.avatar : null;
    let image = linkToS3+this.state.img;
    let adminDropZone;
    const imageCard = <CardMedia overlay={<CardHeader titleStyle={{fontSize:"14px"}} title={this.props.yourAssociation} subtitle={firebaseUtils.getCurrentUser()}></CardHeader>}><img style={{width:"100%",height:"100%"}} src={image}/></CardMedia>;
      if(this.props.you.admin){
        adminDropZone = <Dropzone onDrop={this.onDrop} accept={'image/*'} multiple={false} style={{width:"100%"}}>{imageCard}</Dropzone>;
        }else {
          adminDropZone = imageCard;
        }

        return(
          <LeftNav
            width={300}
            open={this.props.openLeftNav}
            containerStyle={{marginTop:"64px"}}
            >
            <Card className="hide-on-mobile">
              <CardHeader
                title={this.props.you.firstname+" "+this.props.you.lastname}
                subtitle={admin}
                avatar={avatar}
                />
              {adminDropZone}
            </Card>
            <a href="#/dashboard"><MenuItem leftIcon={<Dashboard/>}>Tableau de bord</MenuItem></a>
            <a href="#/dashboard/members"><MenuItem leftIcon={<Person/>}>{membres}</MenuItem></a>
            <a href="#/dashboard/groups"><MenuItem leftIcon={<Group/>}>{groupes}</MenuItem></a>
            <a href="#/dashboard/calendar"><MenuItem leftIcon={<DateRange/>}>Événements</MenuItem></a>
          </LeftNav>
        );
      }
    }
