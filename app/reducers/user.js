/*
** Fonction représentant un reducer pour garder en mémoire les informations de l'utilisateur courant
*/

//On exporte cette fonction pour l'implémenter dans le store
export default function currentUser(state=null, action) {
  switch (action.type) {
    case 'LOGOUT':
      return null;
    case 'LOGIN':
      return Object.assign({},state,action.user);
    default:
      return state;
  }
}
