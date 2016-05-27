/**
** Register.js
**
** Composant d'enregistrement d'association.
** Gère la partie enregistrement d'association de l'application
**
**/

import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import ActionDone from 'material-ui/svg-icons/action/done';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import Toggle from 'material-ui/Toggle';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ActionFace from 'material-ui/svg-icons/action/face';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
import {firebaseUtils} from '../../fb/users';

export class EmailList extends Component {
  iconAdmin(e){
    if(e){
      return (<ActionGrade/>)
    }else{
      return (<ActionFace/>)
    }
  }

  render() {
    let emails = this.props.items.map(function(item) {
      return item['text'];
    });

    return(
      <List>
        <TextField
          style={{display:"none"}}
          id="emails"
          name="emails"
          value={emails.toString()}
          />
        <Subheader>Liste des membres ({this.props.items.length})</Subheader>
        {this.props.items.map((email, emailIndex) =>
          <span key={emailIndex}>
            <Divider/>
            <ListItem
              insetChildren={true}
              key={emailIndex}
              primaryText={email.text}
              leftIcon={this.iconAdmin(email.admin)}
              rightIconButton={<FlatButton onTouchTap={this.props.deleteEmail} secondary={true} value={emailIndex}>Supprimer</FlatButton>}
              />
          </span>
        )}

      </List>
    );
  }
}

export class EmailsApp extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.addEmail = this.addEmail.bind(this);
    this.deleteEmail = this.deleteEmail.bind(this);
    this.onToggled = this.onToggled.bind(this);
    this.state={items: [], email:'', emailError: 'L\'email doit être correct',admin:false}
  }

  validateEmail(e) {
    const email = e.target.value;
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailIsValid = regex.test(email);
    var error;
    if (emailIsValid) {
      error = null;
    } else {
      error = "L'email doit être correct";
    }
    this.setState({ emailError: error });
  }

  deleteEmail(e) {
    var emailIndex = parseInt(e.target.value, 10);
    console.log("Suppression de l'email : %d", emailIndex, this.state.items[emailIndex]);
    this.setState(state =>{
      state.items.splice(emailIndex, 1);
      return {items: state.items};
    });
  }

  onChange(e) {
    this.validateEmail(e);
    this.setState({ email: e.target.value });
  }

  onToggled(e){
    this.setState({admin:!this.state.admin});
  }

  addEmail(e) {
    this.setState({admin:false});
    const emails = this.state.items.map((item)=>item.text);
    if(this.state.emailError == null && emails.indexOf(this.state.email) == -1){
      e.preventDefault();
      var nextItems = this.state.items.concat({text: this.state.email, firstname:"", lastname:"", birthday:"",img:"default.jpg",admin:this.state.admin,adresse:""});
      var nextEmail = '';
      this.setState({items: nextItems, email: nextEmail, emailError:"L'email soit être correct"});
    }
  }

  render() {
    return(
      <div>
        <EmailList items={this.state.items.map((item)=>item)} deleteEmail={this.deleteEmail}/>
        <TextField
          id="email"
          type="email"
          onChange={this.onChange}
          value={this.state.email}
          floatingLabelText="Adresse mail du membre"
          errorText={this.state.emailError}
          fullWidth={true}
          />
        <Toggle
          label="Ce membre est-il administrateur ?"
          onToggle={this.onToggled}
          defaultToggled={this.state.admin}
          /><br/>
        <RaisedButton onTouchTap={this.addEmail} label="Ajouter un email" primary={true}/>
      </div>
    );
  }
}

export default class Register extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {name: '', description: '', error: false, open:false, associationsFromServer:[]};
    this.handleNameFieldChange = this.handleNameFieldChange.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleDescriptionFieldChange = this.handleDescriptionFieldChange.bind(this);
  }

  handleNameFieldChange(e){
    this.setState({
      name: e.target.value
    });
  }

  handleRequestClose(){
    this.setState({
      open:false
    });
  }

  handleDescriptionFieldChange(e){
    this.setState({
      description: e.target.value
    });
  }

  handlePwFieldChange(e){
    this.setState({
      password: e.target.value
    });
  }

  loadAssociationsFromServer() {
    let associations = [];
    ref.orderByKey().once('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        associations.push(snapshot.key());
      });
      this.setState({associationsFromServer: associations});
    });
  }

  handleSubmit(e){
    e.preventDefault();
    let items = this.refs.items.state.items;
    let admin = false;
    items.map((item,i)=>{
      if(item.admin){
        admin = true;
      }
    });
    let nameNotInFB = false;
    this.state.associationsFromServer.map((item)=>{
      if(this.state.name==item){nameNotInFB=true;}
    });
    if(this.state.name && !nameNotInFB && items.length>=1 && admin){
      let fbRef = ref.child(this.state.name).push({description: this.state.description, email:items, img:"card.jpg"});
      fbRef.update({id:fbRef.key()});
      items.map(
        (item)=>{firebaseUtils.createUser({email:item.text, password:'Temp'}, function(err){
          if(!err){
            console.log("Ajout de l'utilisateur : "+item.text);
            firebaseUtils.resetPassword({
              email: item.text
            }, function(error){
              if(error){
                switch (error.code) {
                  case "INVALID_USER":
                  console.log("The specified user account does not exist.");
                  break;
                  default:
                  console.log("Error resetting password:", error);
                }
              } else {
                console.log("Password reset email sent successfully!");
              }
            })
          } else {
            console.log("Attention ! ", err);
            this.setState({
              open: true,
              error: err
            });
          }
        }.bind(this));
      });
      setTimeout(()=>document.getElementById('form').submit(),4000);
      this.setState({
        open:true,
        error:"Vous avez créé votre association !"
      });
    } else if(admin == false){
      this.setState({
        open:true,
        error: "Votre association doit avoir au moins un administrateur."
      });
    } else {
      this.setState({
        open:true,
        error: "Le nom de votre association n'est pas convenable ou inexistant."
      });
    }
  }

  componentDidMount(){
    this.loadAssociationsFromServer();
  }

  render(){
    const style ={
      paperStyle :{
        padding:"15px",
        margin:"15px"
      }
    };
    return (
      <div className="grid grid-pad">
        <form action="/login" id="form" method='post'>
          <h2 style={{marginTop:"64px", textAlign:"center"}}> Inscription de votre association </h2>
          <div className="col-1-2">
            <Paper zDepth={2} style={style.paperStyle} >
              <EmailsApp ref="items" />
            </Paper>
          </div>
          <div className="col-1-2">
            <Paper zDepth={2} style={style.paperStyle} >
              <TextField
                id="name"
                name="association"
                floatingLabelText="Nom de l'association"
                type="text"
                fullWidth={true}
                value={this.state.name}
                onChange={this.handleNameFieldChange}
                />
              <TextField
                id="description"
                name="description"
                floatingLabelText="Description"
                type="text"
                fullWidth={true}
                value={this.state.description}
                onChange={this.handleDescriptionFieldChange}
                multiLine={true}
                rows={2}
                />
              <RaisedButton primary={true} onTouchTap={(e)=>this.handleSubmit(e)} label="Créer votre association"/>
            </Paper>
          </div>
        </form>
        <Snackbar
          open={this.state.open}
          message={this.state.error}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
          />
      </div>
    );
  }
}
Register.contextTypes = {
  router: React.PropTypes.object.isRequired
}
