/*
** Mise en place du store de redux
**
*/

//Importation des packages liés aux reducers et aux cookies
//On veut intégrer dans ce store les états correspondants aux informations de l'utilisateur courant
import cookie from 'cookie';
import {createStore, combineReducers} from 'redux';
import currentAssociation from './reducers/association';
import currentUser from './reducers/user';

//Parsing du cookie afin de récupérer les informations de l'utilisateur
var { association, user, avatar } = cookie.parse(document.cookie||'');
let initialState = {};
if (association) {
  initialState = {currentAssociation:association, currentUser:user};
}

//Combinaison des reducers comprenant l'information de l'association courante et de l'utilisateur courant
const reducer = combineReducers({currentAssociation, currentUser});
const store = createStore(reducer,initialState);
//On effectue une exportation de ce store pour pouvoir le diffuser sur tous les composants
export default store;
