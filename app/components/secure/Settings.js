/*
** Composant enfant du dashboard correspondant à la modification du profil de l'utilisateur et de son mot de passe
*/
//Importation des composant de Material-UI
import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import areIntlLocalesSupported from 'intl-locales-supported'; //Permet de gérer les langues pour les dates
import moment from 'moment'; //Pour gérer les DateTime, http://momentjs.com/
import {firebaseUtils} from '../../fb/users';
import {formatDate} from './Calendar';
//On se connecte au store pour récupérer les infos de l'utilisateur
import {connect} from 'react-redux';
//initialisation de Firebase pour récupérer les infos de l'association
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);

export class Settings extends Component {
  //Mise en place des propriétés initiales et des états
  constructor(props, context){
    super(props, context);
    //On récupère les informations de l'utilisateur depuis Redux Store
    const {firstname, lastname, birthday, phone, adresse} = props.you ? props.you : "";
    this.state={
      firstname,
      lastname,
      oldpassword:'',
      birthday,
      newpassword:'',
      confirmPassword:'',
      emailsFromAssociation:[],
      phone,
      adresse,
      open:false,
      phoneError:"",
      errorPw:"",
      dateError:"",
    };
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.validationPhone = this.validationPhone.bind(this);
    this.loadEmailsFromAssociation = this.loadEmailsFromAssociation.bind(this);
    this.handleConfirmPwFieldChange = this.handleConfirmPwFieldChange.bind(this);
    this.handleOldPwFieldChange = this.handleOldPwFieldChange.bind(this);
    this.handleNewPwFieldChange = this.handleNewPwFieldChange.bind(this);
    this.handleLnFieldChange = this.handleLnFieldChange.bind(this);
    this.handleFnFieldChange = this.handleFnFieldChange.bind(this);
    this.handleInfosSubmit = this.handleInfosSubmit.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.handleBirthDayFieldChange = this.handleBirthDayFieldChange.bind(this);
    this.handlePhoneFieldChange = this.handlePhoneFieldChange.bind(this);
    this.handleDateFieldChange = this.handleDateFieldChange.bind(this);
    this.handleAdresseFieldChange = this.handleAdresseFieldChange.bind(this);
  }
  //On change les états des inputs du profil de l'utilisateur en fonction de ce qui est tapé
  handleOldPwFieldChange(e) {
    this.setState({
      oldpassword:e.target.value
    });
  }
  handleNewPwFieldChange(e) {
    this.setState({
      newpassword:e.target.value
    });
  }
  handleConfirmPwFieldChange(e) {
    this.setState({
      confirmPassword:e.target.value
    });
  }
  handleAdresseFieldChange(e){
    this.setState({
      adresse:e.target.value
    });
  }
  handleLnFieldChange(e) {
    this.setState({
      lastname:e.target.value
    });
  }
  handleFnFieldChange(e){
    this.setState({
      firstname:e.target.value
    });
  }
  handleBirthDayFieldChange(e, date){
    this.setState({
      birthday:date
    });
  }
  handlePhoneFieldChange(e){
    this.validationPhone(e);
    this.setState({
      phone:e.target.value
    });
  }
  handleDateFieldChange(e){
    this.validationDate(e);
    console.log(e.target.value);
    this.setState({
      birthday:e.target.value
    })
  }
  //Une fois les informations validés, on retourne sur le dashboard
  handleRequestClose(){
    this.setState({
      open:false
    });
    if(this.state.errorPw=="Modifications des informations."){
      this.context.router.replace('/dashboard');
    }
  }
  //Chargment des utilisateurs contenus dans l'association dans Firebase
  loadEmailsFromAssociation() {
    let emails = [];
    ref.child(this.props.yourAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        emails=snapshot.val().email;
      });
      this.setState({emailsFromAssociation: emails});
    });
  }
  //Submit des informations
  handleInfosSubmit(e){
    e.preventDefault();
    if(!this.state.phoneError && !this.state.dateError && this.state.firstname!="" && this.state.lastname!="" && this.state.phone!=undefined && this.state.phone != "" && this.state.birthday!="" && this.state.adresse!=undefined && this.state.adresse!=""){
      let id = null;
      this.setState({
        open:true,
        errorPw:"Modifications des informations."
      });
      ref.child(this.props.yourAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
        dataSnapshot.forEach((snapshot) => {
          id=snapshot.val().id;
        });
      });
      const emails = this.state.emailsFromAssociation.map((item)=>item.text);
      const index = emails.indexOf(firebaseUtils.getCurrentUser());
      const {firstname, lastname, phone, birthday, adresse} = this.state ? this.state : "";
      //On effectue un dispatch vers le store pour effectuer un changement des états globaux
      ref.child(this.props.yourAssociation+"/"+id+"/email/"+index).update({
        firstname,
        lastname,
        phone,
        birthday,
        adresse
      },()=>{
        this.props.dispatch({
          type: 'LOGIN',
          association:this.props.yourAssociation,
          user:{
            firstname,
            lastname,
            avatar:this.props.you.avatar,
            phone,
            birthday,
            adresse,
            admin:this.props.you.admin,
          }
        });
      });
      let key = firebaseUtils.getCurrentUser().replace(/\./gi,',');
      //Ajout de l'Anniversaire dans les événements sur Firebase
      ref.child(this.props.yourAssociation+'/calendar/'+key).update({
        title: `${this.state.firstname} ${this.state.lastname}`,
        start: birthday,
        end: birthday,
        description: `${this.state.firstname} fête ses ${moment(birthday,"YYYY-MM-DD").locale('fr').month(0).fromNow(true)}`,
        type: "birthday"
      }, ()=>{
      });
    }else {
      this.setState({
        open:true,
        errorPw:"Veuillez entrez toutes vos informations."
      });
    }
  }
  //Handle le mot de passe et appelle une méthode de firebaseUtils permettant de changer le password
  handlePasswordSubmit(e){
    if(this.state.newpassword==this.state.confirmPassword){
      e.preventDefault();
      this.loadEmailsFromAssociation();

      firebaseUtils.changePw({
        email: firebaseUtils.getCurrentUser(),
        oldPassword: this.state.oldpassword,
        newPassword: this.state.newpassword
      }, function(err){
        if(!err){
          this.setState({
            open:true,
            errorPw:"Votre nouveau mot de passe est validé"
          });
          setTimeout(()=>this.context.router.replace('/dashboard'),3000);
        }
      }.bind(this));
    } else {
      this.setState({
        open:true,
        errorPw:"Il semble que la confirmation ne peut être validée."
      });
    }
  }
  //Fonction de validation de la date par rapport à une regexp
  validationDate(e){
    const date = e.target.value;
    const regex = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
    const dateIsValid = regex.test(date);
    let error;
    if (dateIsValid || date =="") {
      error = null;
    } else {
      error = "La date doit être au format : AAAA-MM-DD";
    }
    this.setState({ dateError: error });
  }
    //Fonction de validation du téléphone par rapport à une regexp
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
    this.setState({ phoneError: error });
  }
  //Une fois le composant chargé on charge les utilisateurs de l'association depuis Firebase
  componentDidMount() {
    this.loadEmailsFromAssociation();
  }
  render() {
    let DateTimeFormat;
    if (areIntlLocalesSupported('fr')) {
      DateTimeFormat = global.Intl.DateTimeFormat;
    }
    return(
      <div className="grid grid-pad">
        <div className="col-1-2" style={{marginTop:"64px"}}>
          <h4>Vos informations personnelles</h4>
          <form onSubmit={(e)=>this.handleInfosSubmit(e)}>
            <TextField
              id="firstname"
              floatingLabelText="Votre prénom"
              type="text"
              defaultValue={this.state.firstname}
              onChange={this.handleFnFieldChange}
              fullWidth={true}
              />

            <TextField
              id="lastname"
              floatingLabelText="Votre nom"
              type="text"
              defaultValue={this.state.lastname}
              onChange={this.handleLnFieldChange}
              fullWidth={true}
              />
            <TextField
              floatingLabelText="Votre date de naissance"
              defaultValue={this.state.birthday}
              fullWidth={true}
              errorText={this.state.dateError}
              onChange={this.handleDateFieldChange}
              />
            <TextField
              id="phone"
              floatingLabelText="Votre numéro de téléphone"
              defaultValue={this.state.phone}
              onChange={this.handlePhoneFieldChange}
              errorText={this.state.phoneError}
              type="tel"
              fullWidth={true}
              />
              <TextField
                id="adresse"
                type="text"
                defaultValue={this.state.adresse}
                floatingLabelText="Adresse postale"
                onChange={this.handleAdresseFieldChange}
                fullWidth={true}
                />
            <RaisedButton type="submit" label="Valider vos informations" primary={true} />
          </form>
        </div>
        <div className="col-1-2" style={{marginTop:"64px"}}>
          <h4>Changement de mot de passe</h4>
          <form onSubmit={(e)=>this.handlePasswordSubmit(e)}>
            <TextField
              id="oldpassword"
              floatingLabelText="Ancien mot de passe"
              type="password"
              value={this.state.oldpassword}
              onChange={this.handleOldPwFieldChange}
              fullWidth={true}
              />
            <TextField
              id="newpassword"
              floatingLabelText="Nouveau mot de passe"
              type="password"
              value={this.state.newpassword}
              onChange={this.handleNewPwFieldChange}
              fullWidth={true}
              />
            <TextField
              id="confirmPassword"
              floatingLabelText="Confirmation du nouveau mot de passe"
              type="password"
              value={this.state.confirmPassword}
              onChange={this.handleConfirmPwFieldChange}
              fullWidth={true}
              />
            <RaisedButton type="submit" label="Changer le mot de passe" primary={true} />
          </form>
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.errorPw}
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose}
          />
      </div>
    );
  }
}
Settings.contextTypes = {
  router: React.PropTypes.object.isRequired
}
export default connect()(Settings);
