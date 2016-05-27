/*
** Fonction représentant un reducer pour garder en mémoire les informations de l'association courante
*/

// On va stocker les informations de l'association au sein d'un cookie qu'il va être nécessaire de parser
import cookie from "cookie"; //https://www.npmjs.com/package/cookie
//
export default function currentAssociation(state=null, action) {
  switch (action.type) {
    case 'LOGIN':
      document.cookie = cookie.serialize("association",action.association);
      return action.association;
    case 'LOGOUT':
      document.cookie = cookie.serialize("association",'', {expires:new Date()});
      return null;
    default:
      return state;
  }
};
