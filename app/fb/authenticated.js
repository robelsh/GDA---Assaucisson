/*
** Fonction permettant de gérer les accès aux pages selon le rôle de l'utilisateur
*/

//Importation du composant login et de firebaseUtils regroupant toutes les fonctions de connexion de l'utilisateur
import Login from "../components/login-register/Login";
import {firebaseUtils} from './users';
//On initialise une nouvelle demande vers la base de données pour l'association
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
//On importe le store contenant les reducers
import store from '../store';

export function requireAuth(nextState, replace) {
  let emails=[];
  let currentAssociation = store.getState().currentAssociation;
  //On récupère le nom de l'association et la fonction isLoggedIn pour savoir si l'utilisateur est sur son association et connecté
  if (!firebaseUtils.isLoggedIn() || !currentAssociation) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    });
    //Dans le cas contraire, on le renvoie vers la page de connexion
  } else {
    ref.child(currentAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        emails=snapshot.val().email;
        let emailConfirmation=emails.map((email)=>email.text);
        if(emailConfirmation.indexOf(firebaseUtils.getCurrentUser()) > -1){
          let user = emails[emailConfirmation.indexOf(firebaseUtils.getCurrentUser())];
          //On injecte s'il est connecté, ses informations (prénom, nom, avatar, date de naissance...)
          store.dispatch({
            type:"LOGIN",
            association:currentAssociation,
            user:{
              firstname:user.firstname,
              lastname:user.lastname,
              avatar:user.img,
              birthday:user.birthday,
              phone:user.phone,
              admin:user.admin,
              adresse:user.adresse,
            }
          });
        } else {
          //S'il est supprimé de l'application mais toujours connecté, on le déconnecte
          firebaseUtils.logout();
          store.dispatch({
            type:"LOGOUT",
          });
        }
      });
    });
  }
}
