/*
** Composant Mail utilisé dans la gestion des membres et des groupes
**
*/
//Implémentation des composants de Material-UI et de firebaseUtils
import {firebaseUtils} from '../../../../fb/users';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React, {Component} from 'react';
import TextField from 'material-ui/TextField';

export default class Mail extends Component {
  //Mise en place des états et des propriétés initiales
  constructor(props) {
    super(props);
    this.state={
      text: "",
      subject:"",
      open:false,
      message:"",
    }
    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleChangeSubject = this.handleChangeSubject.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }
  handleRequestClose(){
    this.setState({
      open:false
    });
  }
  handleChangeText(e){
    this.setState({
      text:e.target.value,
    });
  }
  handleChangeSubject(e){
    this.setState({
      subject:e.target.value,
    });
  }
  //Une fois envoyé, on renvoie l'utilisateur vers le dashboard
  handleSubmit(e){
    e.preventDefault()
    if(this.props.mails[0] && this.state.text && this.state.subject){
      setTimeout(()=>document.getElementById('formSendMail').submit(),3000);
      this.setState({
        open:true,
        message: "Votre message est envoyé !"
      });
    } else {
      this.setState({
        open:true,
        message: "Les champs ne sont pas correctement remplis !"
      });
    }
  }
  render() {
    const style= {
      email :{
        padding:"28px",
        marginTop:"20px",
        marginBottom:"20px"
      }
    }
    return (
      <div>
        <Paper style={style.email}>
          <form id="formSendMail" action="/dashboard" method="post">
            <TextField
              floatingLabelText="Expéditeur"
              id="from"
              name="from"
              fullWidth={true}
              value={firebaseUtils.getCurrentUser()}
              />
            {this.props.group && <h5>Groupe : {this.props.group}</h5>}
            <TextField
              floatingLabelText="Destinataire(s)"
              id="to"
              name="to"
              fullWidth={true}
              value={this.props.mails.map((item,i)=>{
                return this.props.mails[i]
              })
            }/>
            <TextField
              id="subject"
              name="subject"
              onChange={this.handleChangeSubject}
              value={this.state.subject}
              floatingLabelText="Quel sujet voulez-vous aborder ?"
              /><br/>
            <TextField
              id="text"
              name="text"
              onChange={this.handleChangeText}
              value={this.state.text}
              fullWidth={true}
              multiLine={true}
              rows={3}
              floatingLabelText="Votre message..."
              /><br/>
            <RaisedButton primary={true} onTouchTap={(e)=>this.handleSubmit(e)} label="Envoyer"/>
          </form>
        </Paper>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onRequestClose={this.handleRequestClose}
          />
      </div>
    );
  }
}
