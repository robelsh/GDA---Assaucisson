/*
** Ensemble de fonctions comprenant toutes les méthodes de connexion et d'inscription
** Pour plus d'informations, voir https://www.firebase.com/docs/web/guide/login/password.html
*/

//Importation de Firebase et initialisation pour l'authentification
import Firebase from 'firebase';
let forge = "https://gda.firebaseio.com/";
let ref = new Firebase(forge);
let cachedUser = null;

//Récupération de toutes les erreurs possibles lors de la connexion
let genErrorMsg = (e) => {
  let message = "";
  switch (e.code) {
    case 'EMAIL_TAKEN':
    message = "Certains utilisateurs appartiennent déjà à une ou plusieurs associations."
    break;
    case 'INVALID_EMAIL':
    message = "L'adresse mail spécifiée n'est pas valide."
    break;
    case 'INVALID_USER':
    message = "L'utilisateur spécifié n'existe pas."
    break;
    case 'INVALID_PASSWORD':
    message = "Le mot de passe n'est pas valide."
    break;
    case 'NETWORK_ERROR':
    message = "Problème de connexion. Veuillez vérifier votre connexion à Internet."
    break;
    case 'TRANSPORT_UNAVAILABLE':
    message = "Le navigateur que vous utilisez n'est pas adapté à cette application."
    break;
    case 'UNKNOWN_ERROR':
    message = "Une erreur inconnue est survenue. Si elle persiste, veuillez contacter un Administrateur."
    /* Fall through */
    default:
    message = "Erreur inconnue !"
    break;
  }
  return message;
}
//Ensemble des fonctions
export let firebaseUtils = {
  //Création d'un utilisateur
  createUser: function(user, cb) {
    ref.createUser(user, function(err) {
      if (err) {
        let message = genErrorMsg(err);
        console.log(message);
        cb(message);
      } else {
        cb(false);
        console.log("User created !");
      }
    }.bind(this));
  },
  //Reset Password
  resetPassword: function(user, cb) {
    ref.resetPassword( user, function(err) {
      if (err) {
        let message = genErrorMsg(err);
        console.log(message);
        console.log(user);
        cb(message);
      } else {
        cb(false);
        console.log("Password reset email sent successfully!");
      }
    }.bind(this));
  },
  //Connexion
  loginWithPW: function(userObj, cb, cbOnRegister){
    ref.authWithPassword(userObj, function(err, authData){
      if(err){
        let message = genErrorMsg(err);
        if (cbOnRegister) {
          cbOnRegister(message);
        } else {
          cb && cb(message);
        }
        console.log(message);
      } else {
        authData.email = userObj.email;
        cachedUser = authData;
        this.onChange(true);
        if(cbOnRegister) {
          cb(authData);
          cbOnRegister(false);
        } else {
          cb(false);
        }
      }
    }.bind(this));
  },
  //L'utilisateur est-il connecté ?
  isLoggedIn: function(){
    if(ref.getAuth()){
      return true;
    }else{
      return false;
    }
  },
  //Déconnexion de l'utilisateur
  logout: function(){
    ref.unauth();
    cachedUser = null;
    this.onChange(false);
  },
  //Récupérer l'utilisateur courant
  getCurrentUser: function() {
    return ref.getAuth().password.email;
  },
  //Changement de mot de passe
  changePw: function(user, cb) {
    ref.changePassword(user, function(err){
      if (err) {
        let message = genErrorMsg(err);
        console.log(message);
        cb(message);
      } else {
        console.log("User password changed successfully!");
        cb(false);
      }
    });
  }
};
