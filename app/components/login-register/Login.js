/**
** Login.js
**
** Composant de login.
** Gère la partie login de l'application
**
**/

import React, {Component} from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
import {firebaseUtils} from '../../fb/users';
import {connect} from 'react-redux';


export class Login extends Component {
  constructor(props, context){
    super(props, context);
    this.state = {
      error:false,
      openReset:false,
      open:false,
      firstname: "",
      lastname: "",
      avatar: "",
      birthday:"",
      pw: "",
      association: "",
      associationsFromServer:[],
      emailsFromAssociation:[],
      slideIndex:0,
      associationIsNotValid:true,
      emailToReset:"",
      adresse:""
    };
    this.handleSubmitResetPassword = this.handleSubmitResetPassword.bind(this);
    this.handleChangeEmailToReset = this.handleChangeEmailToReset.bind(this);
    this.handleOpenResetPw = this.handleOpenResetPw.bind(this);
    this.handleCloseResetPw = this.handleCloseResetPw.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.loginWithFB = this.loginWithFB.bind(this);
    this.handleUpdateInput = this.handleUpdateInput.bind(this);
    this.handleEmailFieldChange = this.handleEmailFieldChange.bind(this);
    this.handlePwFieldChange = this.handlePwFieldChange.bind(this);
    this.loadAssociationsFromServer = this.loadAssociationsFromServer.bind(this);
    this.handleChangeSlideIndex = this.handleChangeSlideIndex.bind(this);
  }

  //Handle sur la modification de l'input où l'on rentre le nom de l'association.
  handleUpdateInput(e) {
    this.setState({
      association: e
    });
    if(this.state.associationsFromServer.indexOf(e) != -1 ){
      this.setState({
        associationIsNotValid:false
      });
    }else{
      this.setState({
        associationIsNotValid:true
      });
    }
  }

  handleRequestClose(){
    this.setState({
      open:false
    });
  }

  //Gére les slides.
  handleChangeSlideIndex(e){
    this.setState({
      slideIndex: e
    });
    if(e==0){
      this.setState({
        email: "",
        association: "",
        associationIsNotValid:true,
      });
    }
  }

  //Handle sur la champ text (input) email lors de la restauration de mot de passe.
  handleChangeEmailToReset(e){
    this.setState({
      emailToReset:e.target.value
    });
  }

  //Handle sur la restauration du mot de passe.
  handleSubmitResetPassword(){
    firebaseUtils.resetPassword({email: this.state.emailToReset}, function(err){
      if(!err){
        console.log("L'envoi de mail a été effectué !");
      } else {
        console.log(err);
        this.setState({
          error:err,
          open:true
        });
      }
    }.bind(this));
  }

  //Vérifie la validité du champ email.
  emailConfirmation(email, condition) {
    let emailConfirmation=this.state.emailsFromAssociation.map((item)=>
      item.text
    );
    if(emailConfirmation.indexOf(email) != -1){
      let user = this.state.emailsFromAssociation[emailConfirmation.indexOf(email)];
      this.setState({
        firstname:user.firstname,
        lastname:user.lastname,
        avatar:user.img,
        phone:user.phone,
        birthday:user.birthday,
        admin:user.admin,
        adresse:user.adresse,
      });
      console.log("Vous êtes en train de vous connecter avec l'utilisateur "+user.firstname+" "+user.lastname);
      condition();
    }else{
      console.log("Login Failed...");
      this.setState({
        error:"Mauvais idéntifiants.",
        open: true
      });
    }
  }

  handleEmailFieldChange(e) {
    const email = e.target.value;
    this.setState({
      email,
    });
    this.loadEmailsFromAssociation(this.state.association);
  }

  handlePwFieldChange(e) {
    this.setState({
      pw : e.target.value
    });
  }

  loginWithFB(){
    firebaseUtils.loginWithPW({email: this.state.email, password: this.state.pw}, function(err){
      if(!err){
        const {firstname, lastname, avatar, phone, birthday, admin, adresse}=this.state;
        this.props.dispatch({
          type: 'LOGIN',
          association: this.state.association,
          user:{
            firstname,
            lastname,
            avatar,
            phone,
            birthday,
            adresse,
            admin,
          }
        });
        this.setState({
          open:true,
          error:"Connexion en cours. Merci de patienter..."
        });
        setTimeout(()=>this.context.router.replace('/dashboard'),2000);
      } else {
        console.log("Login failed! ", err);
        this.setState({
          open: true,
          error: err
        });
      }
    }.bind(this));
  }

  handleSubmit(e){
    e.preventDefault();
    this.emailConfirmation(this.state.email,this.loginWithFB);
  }

  //Charge les associaitons depuis le serveur (Firebase)
  loadAssociationsFromServer() {
    let associations = [];
    ref.orderByKey().once('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        associations.push(snapshot.key());
      });
      this.setState({associationsFromServer: associations});
    });
  }

  //Charge les emails des adhérents de l'association.
  loadEmailsFromAssociation(e) {
    let emails = [];
    ref.child(e).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        emails=snapshot.val().email;
      });
      this.setState({emailsFromAssociation: emails});
    });
  }

  handleOpenResetPw(){
    this.setState({
      openReset:true
    });
  }

  handleCloseResetPw(){
    this.setState({
      openReset:false
    });
  }

  componentDidMount() {
    this.loadAssociationsFromServer();
    if (this.state.email!='') {this.loadEmailsFromAssociation(this.state.association)};
  }

  render(){
    let errors = this.state.error;
    const style ={
      paperStyle :{
        padding:"15px",
        marginTop:"64px",
        marginBottom:"15px",
      },
      titleStyle :{
        textAlign:"center"
      }
    };

    return (
      <div className="grid grid-pad">
        <Dialog
          title="Réinitialisation de votre mot de passe"
          modal={false}
          open={this.state.openReset}
          onRequestClose={this.handleCloseResetPw}
          >
          <form onSubmit={()=>this.handleSubmitResetPassword()}>
            <TextField
              floatingLabelText="Votre adresse mail"
              value={this.state.emailToReset}
              onChange={this.handleChangeEmailToReset}
              />
            <br />
            <RaisedButton type="submit" label="Réinitialiser" primary={true}/>
          </form>
        </Dialog>
        <div className="col-1-2 push-1-4">
          <Paper zDepth={2} style={style.paperStyle}>
            <form onSubmit={(e)=>this.handleSubmit(e)}>
              <Tabs
                onChange={this.handleChangeSlideIndex}
                value={this.state.slideIndex}
                >
                <Tab label="Association" value={0} />
                <Tab disabled={this.state.associationIsNotValid} label="Connexion" value={1} />
              </Tabs>
              <SwipeableViews
                index={this.state.slideIndex}
                onChangeIndex={this.handleChangeSlideIndex}>
                <div>
                  <AutoComplete
                    fullWidth={true}
                    onUpdateInput={this.handleUpdateInput}
                    onNewRequest={this.handleUpdateInput}
                    searchText={this.state.association}
                    floatingLabelText="Choisissez votre association"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.associationsFromServer}
                    />
                  <RaisedButton onTouchTap={(e)=>this.handleChangeSlideIndex(1)} label="Entrez vos identifiants" disabled={this.state.associationIsNotValid} primary={true}/>
                </div>
                <div>
                  <TextField
                    id="email"
                    floatingLabelText="Votre adresse mail"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleEmailFieldChange}
                    fullWidth={true}
                    />
                  <TextField
                    id="pw"
                    floatingLabelText="Mot de passe"
                    type="password"
                    value={this.state.pw}
                    onChange={this.handlePwFieldChange}
                    fullWidth={true}
                    />
                  <RaisedButton type="submit" label="Se connecter" primary={true}  style={{marginBottom:"20px"}} />
                  <br />
                  <small style={{cursor:"pointer", color:"rgb(0, 188, 212)"}} onTouchTap={this.handleOpenResetPw}>Vous avez oublié votre mot de passe ? Cliquez ici !</small>
                </div>
              </SwipeableViews>
            </form>
          </Paper>
        </div>
        <Snackbar
          open={this.state.open}
          message={errors}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
          />
      </div>
    );
  }
}
Login.contextTypes = {
  router: React.PropTypes.object.isRequired
}

export default connect()(Login)
