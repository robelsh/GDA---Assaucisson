/*
** Composant gérant toute la gestion des adhérents de l'association courante
*/

//Importation des composants Material-UI
import ActionDone from 'material-ui/svg-icons/action/done';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionEmail from 'material-ui/svg-icons/communication/email';
import ActionEdit from 'material-ui/svg-icons/editor/mode-edit';
import Avatar from 'material-ui/Avatar';
import Dialog from 'material-ui/Dialog';
//Utilisation de Dropzone : https://github.com/okonet/react-dropzone
import Dropzone from "react-dropzone";
import {EmailList,EmailsApp} from '../login-register/Register';
import {firebaseUtils} from '../../fb/users';
import IconButton from 'material-ui/IconButton';
import Mail from './subcomponents/mail/Mail';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React, {Component} from "react";
import {red500} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import CommunicationCall from 'material-ui/svg-icons/communication/call';
import CommunicationEmail from 'material-ui/svg-icons/communication/email';
import HomeIcon from 'material-ui/svg-icons/action/home';
import AccountCircle from 'material-ui/svg-icons/action/account-circle';
import Toggle from 'material-ui/Toggle';
import {List, ListItem} from 'material-ui/List';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

//initialisation de Firebase pour l'association et les membres (firebaseUtils)
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
//Utilisation de superagent pour les requêtes vers le serveur S3
var request = require('superagent');

export default class Members extends Component{
  //Mise en place des propriétés initiales et des états
  constructor(props, context){
    super(props, context);
    //Récupération depuis React-redux de l'avatar de l'utilisateur
    const defaultImg = props.you ? props.you.avatar : "default.jpg";
    this.state = {
      idFromAssociation:[],
      items:[],
      generating:false,
      openAvatar:false,
      handleDelete:false,
      opendEdit:false,
      openNewUser:false,
      openInfos:false,
      currentUser:"",
      firstname:"",
      lastname:"",
      img:defaultImg,
      file:null,
      mails:[],
      phone:"",
      errorPhone:"",
      admin:"",
      adresse:"",
      openDelete:"",
      currentIndex:""
    };
    this.validationPhone = this.validationPhone.bind(this);
    this.loadUsersAndIdFromAssociation=this.loadUsersAndIdFromAssociation.bind(this);
    this.deleteUser=this.deleteUser.bind(this);
    this.handleEditUser=this.handleEditUser.bind(this);
    this.editUser=this.editUser.bind(this);
    this.handleMailUser=this.handleMailUser.bind(this);
    this.handleDisplayAvatar=this.handleDisplayAvatar.bind(this);
    this.handleCloseAvatar=this.handleCloseAvatar.bind(this);
    this.handleCloseNewUser=this.handleCloseNewUser.bind(this);
    this.handleCloseEdit=this.handleCloseEdit.bind(this);
    this.handleFirstNameFieldChange=this.handleFirstNameFieldChange.bind(this);
    this.handleLastNameFieldChange=this.handleLastNameFieldChange.bind(this);
    this.handlePhoneFieldChange=this.handlePhoneFieldChange.bind(this);
    this.handleAdresseFieldChange=this.handleAdresseFieldChange.bind(this);
    this.newUser=this.newUser.bind(this);
    this.newAvatar=this.newAvatar.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.openInfos = this.openInfos.bind(this);
    this.closeInfos = this.closeInfos.bind(this);
    this.onAdminToggle = this.onAdminToggle.bind(this);
    this.handleCloseDelete = this.handleCloseDelete.bind(this);
    this.handleOpenDelete = this.handleOpenDelete.bind(this);
  }
  //Utilisation de JSPF pour la génération du PDF de la liste des membres https://github.com/MrRio/jsPDF
  generatePDFFile(){
    let self = this;
    let doc = new jsPDF('landscape');

    doc.fromHTML(document.getElementById("members"),40,40,{"width":150},function(){
      doc.save("Trombinoscope.pdf");
      self.setState({
        generating:false,
      });
    });
  }
  generatePDF(){
    this.setState({
      generating:true,
    })
  }
  //Chargment des utilisateurs et de l'ID de l'association courante
  loadUsersAndIdFromAssociation() {
    let emails = [];
    let id = [];
    ref.child(this.props.yourAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        emails=snapshot.val().email;
        id=snapshot.val().id;
      });
      this.setState({
        items: emails,
        idFromAssociation: id,
      });
    });
  }
  //On utilise un tableau intermédiaire pour supprimer l'utilisateur dans la liste
  deleteUser(e){
    let emailIndex = parseInt(this.state.currentIndex, 10);
    this.setState(state =>{
      state.items.splice(emailIndex, 1);
      return {items: state.items, handleDelete:true};
    });
    this.handleCloseDelete();
  }
//Récupération des données depuis les inputs de la fenêtre modale 'Inviter des membres'
  handleEditUser(e){
    this.setState({firstname:e.firstname,lastname:e.lastname,phone:e.phone,adresse:e.adresse,admin:e.admin});
    if(e.phone !=""){
      this.setState({errorPhone:null})
    }
    this.setState({currentUser: e});
    this.setState({openEdit: true});
  }
  //Edition de l'utilisateur vers Firebase
  editUser(e){
    const emails = this.state.items.map((item)=>item);
    const index = emails.indexOf(this.state.currentUser);
    if(this.state.errorPhone==null && this.state.phone != undefined){
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+index).update({phone:this.state.phone});
    }
    if (this.state.errorPhone==null) {
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+index).update({firstname: this.state.firstname, lastname:this.state.lastname,adresse:this.state.adresse,admin:this.state.admin});
      console.log(this.state.firstname+" "+this.state.lastname+" modifié correctement");
      this.handleCloseEdit();
    }
  }
  //Ouverture de la fenêtre modale d'ajout d'un nouvel utilisateur
  handleOpenNewUser(e){
    this.setState({openNewUser: true});
  }
  //Ouverture de la confirmation de suppression
  handleOpenDelete(e){
    this.setState({openDelete: true, currentIndex:e});
  }
  //Ajout d'un nouvel avatar vers Firebase
  newAvatar(e){
    const emails = this.state.items.map((item)=>item);
    const index = emails.indexOf(this.state.currentUser);
    ref.child(this.props.yourAssociation+"/"+this.state.id+"/email/"+index).update({img:this.state.file[0].name});
    this.handleCloseAvatar();
  }
  //Ajout d'un nouvel utilisateur vers Firebase et modfication de la liste des membres
  newUser(e){
    e.preventDefault();
    const arrayOfEmails = this.state.items.map((item)=>item);
    const emails = this.state.items.map((item)=>item.text);
    {this.refs.items.state.items.map(
      (item,i)=>{
        let index = arrayOfEmails.length+i;
        if(emails.indexOf(item.text) > -1){
          console.log("Déjà présente !");
        } else {
          ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+index+'/').update({admin:item.admin,firstname:"",lastname:"",birthday:"",img:"default.jpg",text:item.text,adresse:""});
          console.log("Ajout de l'utilisateur : "+item.text);
          firebaseUtils.createUser({email:item.text, password:"Temp"}, function(){
            firebaseUtils.resetPassword({email: item.text}, function(){
              console.log("L'envoi de mail vers "+item.text+" a été effectué !");
            }.bind(this));
          }.bind(this));
          setTimeout(()=>{
            document.getElementById('form').submit();
            this.handleCloseNewUser();
          },1000);
        }
      });
    }
  }
  //Une fois le composant modifié, on regénère en fond de tâche le nouveau PDF à télécharger
  //Si on supprime dans la liste un utilisateur, on remet à jour cette liste
  componentDidUpdate(){
    if (this.state.generating) {
      this.generatePDFFile();
    }
    if (this.state.handleDelete) {
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation).update({email:this.state.items});
      this.setState({
        handleDelete:false,
      });
    }
  }
  //Ajout d'un utilisateur dans le champ destination de l'email
  handleMailUser(e){
    var mails = this.state.mails;
    if(mails.indexOf(e.text)==-1){
      mails.push(e.text);
    }
    this.setState({mails:mails});
  }
  //On affiche quand on clique sur l'avatar de l'utilisateur, l'image plus grande dans une fenêtre
  handleDisplayAvatar(e){
    this.setState({openAvatar: true});
    this.setState({currentUser: e});
    const emails = this.state.items.map((item)=>item);
    const index = emails.indexOf(e);
    this.setState({img:emails[index].img});
  }
  //Gestion de la fermeture des fenêtres modales
  handleCloseAvatar(e){
    this.setState({openAvatar: false});
  }
  handleCloseEdit(e){
    this.setState({openEdit: false});
  }
  handleCloseNewUser(e){
    this.setState({openNewUser: false});
  }
  handleCloseDelete(){
    this.setState({openDelete: false});
  }
  //Changement des états en fonction de ce qui a été tapé dans les champs
  handleFirstNameFieldChange(e) {
    const firstname = e.target.value;
    this.setState({
      firstname,
    });
  }
  //On change le rôle du membre dans la fenêtre d'édition
  onAdminToggle(){
    this.setState({admin : !this.state.admin});
  }
  handleLastNameFieldChange(e) {
    const lastname = e.target.value;
    this.setState({
      lastname,
    });
  }
  handlePhoneFieldChange(e) {
    this.validationPhone(e);
    const phone = e.target.value;
    this.setState({
      phone,
    });
  }
  //Vérifie si le numéro de téléphone est dans le bon format
  validationPhone(e) {
    const phone = e.target.value;
    const regex = /^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/;
    const phoneIsValid = regex.test(phone);
    let error;
    if (phoneIsValid || phone == "") {
      error = null;
    } else {
      error = "Le numéro de téléphone doit être correct";
    }
    this.setState({ errorPhone: error });
  }
  componentDidMount(){
    this.loadUsersAndIdFromAssociation();
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
      const emails = this.state.items.map((item)=>item);
      const index = emails.indexOf(this.state.currentUser);
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+index).update({img:file[0].name.toLowerCase()});
    },3000);
  }
  openInfos(item){
    this.setState({openInfos:true, currentUser:item});
  }
  closeInfos(){
    this.setState({openInfos:false});
  }
  handleAdresseFieldChange(e){
    const adresse = e.target.value;
    this.setState({
      adresse,
    });
  }

  render() {
    //Connexion vers Amazon S3
    const linkToS3 ="https://assaucisson.s3-us-west-2.amazonaws.com/";
    const img = linkToS3+this.state.img;
    let actionsAvatar;
    let adminInvit;
    let adminDropZone;
    //Gestion de l'affichage en fonction des droits.
    if(this.props.you.admin){
      adminInvit = <RaisedButton label="Inviter des membres" primary={true} onTouchTap={this.handleOpenNewUser.bind(this)}/>;
      adminDropZone = <Dropzone accept={'image/*'} multiple={false} onDrop={this.onDrop} style={{width:"100%"}}><div><img style={{width:"100%",height:"100%"}} src={img}/></div></Dropzone>;
      }else{
        adminDropZone = <img style={{width:"100%",height:"100%"}} src={img}/>;
      }
      let table = "";
      let emailConfirmation=this.state.items.map((item)=>{
        return item.text;
      });
      const style= {
        email :{
          padding:"28px",
          marginTop:"20px"
        }
      }
      const actionsEdit = [
        <RaisedButton
          label="Valider"
          secondary={true}
          onTouchTap={this.editUser}
          />,
        <RaisedButton
          label="Annuler"
          primary={true}
          onTouchTap={this.handleCloseEdit}
          />,
      ];
      const actionsDelete = [
        <RaisedButton
          label="Valider"
          secondary={true}
          onTouchTap={this.deleteUser}
          />,
        <RaisedButton
          label="Annuler"
          primary={true}
          onTouchTap={this.handleCloseDelete}
          />,
      ];

      let trombi;
      if(this.state.generating) {trombi=<div id="members">
        <table>
          <colgroup>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
          </colgroup>
          <thead>
            <tr>

              <th>Prénom</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Adresse</th>
            </tr>
          </thead>
          <tbody>
            {this.state.items.map((item,i)=>{
              let path = "../../assets/img/default.jpg";
              return <tr key={i}>
                <td>{item.firstname}</td>
                <td>{item.lastname}</td>
                <td>{item.phone}</td>
                <td>{item.text}</td>
                <td>{item.adresse}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    }else{
      trombi=<RaisedButton label="Générer un annuaire" secondary={true} onTouchTap={()=>this.generatePDF()}/>;
    }
    return (
      <div className="grid grid-pad">

        <Dialog
          modal={false}
          open={this.state.openNewUser}
          onRequestClose={this.handleCloseNewUser}
          autoScrollBodyContent={true}
          repositionOnUpdate={true}
          >
          <form action="/sendIns" method="post" id="form">
            <TextField
              style={{display:"none"}}
              id="association"
              name="association"
              value={this.props.yourAssociation}
              />
            <EmailsApp ref="items"/>

          </form>
          <RaisedButton form="form" primary={true} style={{float:"right"}} onTouchTap={(e)=>this.newUser(e)} label="Valider"/>
        </Dialog>

        <Dialog
          modal={false}
          open={this.state.openAvatar}
          onRequestClose={this.handleCloseAvatar}
          style={{zIndex:"100000"}}
          >
          {adminDropZone}
        </Dialog>
        <Dialog
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete}
          actions={actionsDelete}
          >
          <h3>Confirmer la suppression ?</h3>
        </Dialog>
        <Dialog
          modal={false}
          open={this.state.openInfos}
          onRequestClose={this.closeInfos}
          >
          <List>
            <ListItem disabled={true} leftIcon={<AccountCircle />}>
              {this.state.currentUser.lastname} {this.state.currentUser.firstname}
            </ListItem>
            <ListItem disabled={true} leftIcon={<CommunicationEmail/>}>
              {this.state.currentUser.text}
            </ListItem>
            <ListItem disabled={true} leftIcon={<CommunicationCall/>}>
              {this.state.currentUser.phone}
            </ListItem>
            <ListItem disabled={true} leftIcon={<HomeIcon />}>
              {this.state.currentUser.adresse}
            </ListItem>
          </List>
        </Dialog>
        <Dialog
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit}
          actions={actionsEdit}
          bodyStyle={{overflowY:"auto"}}
          >
          Edition
          <TextField
            disabled
            id="email"
            type="email"
            value={this.state.currentUser.text}
            floatingLabelText="Adresse mail du membre"
            fullWidth={true}
            />
          <TextField
            id="firstname"
            type="text"
            value={this.state.firstname}
            floatingLabelText="Prénom du membre"
            onChange={this.handleFirstNameFieldChange}
            fullWidth={true}
            />
          <TextField
            id="lastname"
            type="text"
            value={this.state.lastname}
            floatingLabelText="Nom du membre"
            onChange={this.handleLastNameFieldChange}
            fullWidth={true}
            />
          <TextField
            id="phone"
            type="text"
            value={this.state.phone}
            floatingLabelText="Numéro de téléphone du membre"
            onChange={this.handlePhoneFieldChange}
            fullWidth={true}
            errorText={this.state.errorPhone}
            />
          <TextField
            id="adresse"
            type="text"
            value={this.state.adresse}
            floatingLabelText="Adresse postale du membre"
            onChange={this.handleAdresseFieldChange}
            fullWidth={true}
            />
          <Toggle
            label="Admin"
            defaultToggled={this.state.admin}
            labelPosition="right"
            onToggle={this.onAdminToggle}
            />
        </Dialog>
        <div style={{textAlign:"center",marginTop:"64px"}}>
          <h1 style={{fontFamily:"Damion"}}>Membres</h1>
          {adminInvit}
          {trombi}
        </div>
        <div className="col-1-1"  >
          <Table
            bodyStyle={{overflowY:"auto",height:"200px"}}
            fixedHeader={true}
            fixedFooter={true}
            selectable={false}
            multiSelectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
              enableSelectAll={false}>
              <TableRow>
                <TableHeaderColumn style={{width:"40px"}}></TableHeaderColumn>
                <TableHeaderColumn>Prénom & nom</TableHeaderColumn>
                <TableHeaderColumn className="hide-on-mobile">Contact</TableHeaderColumn>
                {this.props.you.admin && <TableHeaderColumn>Actions</TableHeaderColumn>}
              </TableRow>
            </TableHeader>
            <TableBody
              preScanRows={true}
              displayRowCheckbox={false}
              showRowHover={true}>
              {this.state.items.map((item,emailIndex)=>{
                const image=linkToS3+item.img;
                return <TableRow key={emailIndex} selected={item.selected}>
                  <TableRowColumn style={{width:"40px"}}>
                    <Avatar style={{marginLeft:"-20px"}} onTouchTap={(e)=>this.handleDisplayAvatar(item)} src={image}/>
                  </TableRowColumn>
                  <TableRowColumn style={{cursor:"pointer"}} onTouchTap={(e)=>this.openInfos(item)}>
                    <ListItem
                      disabled={true}
                      >
                      {item.firstname} {item.lastname}
                    </ListItem>
                  </TableRowColumn>
                  <TableRowColumn className="hide-on-mobile">{item.text}</TableRowColumn>

                  <TableRowColumn>
                    { this.props.you.admin && firebaseUtils.getCurrentUser()!==item.text &&
                      <IconButton onTouchTap={(e)=>this.handleEditUser(item)}>
                        <ActionEdit className="material-icons"/>
                      </IconButton>
                    }
                    <IconButton onTouchTap={(e)=>this.handleMailUser(item)}>
                      <ActionEmail className="material-icons"/>
                    </IconButton>
                    { this.props.you.admin && firebaseUtils.getCurrentUser()!==item.text &&

                      <IconButton onTouchTap={(e)=>this.handleOpenDelete(emailIndex)}>
                        <ActionDelete className="material-icons" color={red500}/>
                      </IconButton>
                    }
                  </TableRowColumn>

                </TableRow>})}
              </TableBody>
            </Table>
            <h2>Envoyer un email</h2>
            <Mail mails={this.state.mails}/>
          </div>
        </div>
      );
    }
  };
