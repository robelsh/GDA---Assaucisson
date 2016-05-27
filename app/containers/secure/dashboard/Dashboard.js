/*
** Composant regroupant tous les éléments enfants du dashboard (Panel, Groups, Leftnav, Members..)
*/

//Important des éléments de Material-UI
import React, {Component} from 'react';
import {firebaseUtils} from '../../../fb/users';
import Paper from 'material-ui/Paper';
import MenuItem from 'material-ui/MenuItem';
import AspectRatio from 'material-ui/svg-icons/action/aspect-ratio';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import Leftnav from '../../../components/secure/Leftnav';
import CircularProgress from 'material-ui/CircularProgress';
//On importe connect de react-redux pour effectuer une relation entre le store de Redux et ce composant
import {connect} from 'react-redux'; //https://github.com/reactjs/react-redux
import './style.css';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import SelectField from 'material-ui/SelectField';
//Mise en place des thèmes
import Theme, {themeIsen} from "../../../themes/Themes";
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
//initialisation de Firebase pour les associations
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
//Récupération des thèmes
import getMuiTheme from 'material-ui/styles/getMuiTheme';


export class Dashboard extends Component {
    //mise en place des propriétés initiales et des états
  constructor(props) {
    super(props);
    this.state={open:true,value:1,theme: lightBaseTheme,id:[],themeFb:[],contentClass:"content"}
    this.handleOpenLeftNav = this.handleOpenLeftNav.bind(this);
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  //Chargement des associations depuis Firebase. Voir ci-dessous pour récupérer des données sur Firebase
  // https://www.firebase.com/docs/web/guide/retrieving-data.html
  loadAssociationFromServer() {
    let id=[];
    let theme=[];
    ref.child(this.props.currentAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        id=snapshot.val().id;
        theme=snapshot.val().theme;
      });
      switch(theme){
        case 1:
        this.setState({theme:lightBaseTheme});
        break;
        case 2:
        this.setState({theme:darkBaseTheme});
        break;
        case 3:
        this.setState({theme:Theme});
        break;
        case 4:
        this.setState({theme:themeIsen});
        break;
        default:
        break;
      }
      this.setState({id : id,value:theme});
    });
  }

  //Toggle pour la SideBar
  handleOpenLeftNav(){
    if(this.state.open){
      this.setState({
        contentClass:"content0padding"
      });
    }else{
      this.setState({
        contentClass:"content"
      });
    }
    this.setState({
      open:!this.state.open
    });
  }
  //Récupération du thème
  getChildContext() {
    return {
      muiTheme: getMuiTheme(this.state.theme)
    };
  }
  //Permet de changer le thème sur firebase
  handleChange(event, index, value){
    ref.child(this.props.currentAssociation+'/'+this.state.id+'/').update({theme:value});
    this.setState({
      value,
    });
  }
  //En fonction de l'état du SelectField, on change le thème de l'association
  handleChangeTheme(event, index, value){
    this.handleChange(event, index, value);
    switch(value){
      case 1:
      this.setState({theme:lightBaseTheme});
      break;
      case 2:
      this.setState({theme:darkBaseTheme});
      break;
      case 3:
      this.setState({theme:Theme});
      break;
      case 4:
      this.setState({theme:themeIsen});
      break;
      default:
      break;
    }
  }
  //Une fois le composant monté, on relance un chargment des données de l'association
  componentDidMount(){
    this.loadAssociationFromServer();
  }
  render(){
    let you = this.props.currentUser ? this.props.currentUser : "";
    //On ajoute les propriétés correspondantes à l'utilisateur courant et à l'association à tous les compants enfants du Dashboard
    const childrenWithProps = React.Children.map(this.props.children, (child)=> React.cloneElement(child, {yourAssociation:this.props.currentAssociation, you:you}));
    const style={
      loadingScreen : {
        position:"fixed",
        top:"0",
        left:"0",
        right:"0",
        bottom:"0",
        zIndex:"9999",
        backgroundColor:"rgb(255,255,255)",
      },
      circularStyle : {
        marginTop:"25%",
        left:"45%",
      }
    }
    return(
      <div className="grid grid-pad">
        {!you && <div style={style.loadingScreen} ><CircularProgress style={style.circularStyle} size={2} /></div>}
        <IconButton style={{position:"fixed",left:4,top:8,zIndex:9999}} onTouchTap={this.handleOpenLeftNav}><NavigationMenu color="#fff"/></IconButton>
          <div className="hide-on-mobile">
            {you.admin && <SelectField
            style={{width:"100px", position:"fixed",zIndex:"1200",marginLeft:"240px", marginTop:"-14px"}}
            autoWidth={true}
            value={this.state.value}
            onChange={this.handleChangeTheme}
            >
            <MenuItem value={1} primaryText="Light"/>
            <MenuItem value={2} primaryText="Dark"/>
            <MenuItem value={3} primaryText="Classique"/>
            <MenuItem value={4} primaryText="ISEN"/>
          </SelectField>}</div>
        <div className={this.state.contentClass}>
          {childrenWithProps}
        </div>
        <Leftnav blur={blur} openLeftNav={this.state.open} yourAssociation={this.props.currentAssociation} you={you}/>
      </div>
    );
  }
}

Dashboard.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
}

function mapStateToProps({ currentAssociation, currentUser}) {
  return {
    currentUser,
    currentAssociation,
  }
}
export default connect(mapStateToProps)(Dashboard)
