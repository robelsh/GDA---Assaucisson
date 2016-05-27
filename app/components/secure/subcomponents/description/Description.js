/**
** Description.js
**
** Composant de description.
** Gère la partie description de l'association dans l'application
**
**/

import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import Firebase from 'firebase';
import ActionEdit from 'material-ui/svg-icons/editor/mode-edit';
import Check from 'material-ui/svg-icons/navigation/check';
import IconButton from 'material-ui/IconButton';
var forge = "https://gda.firebaseio.com/association";
import TextField from 'material-ui/TextField';
var ref = new Firebase(forge);
import RaisedButton from 'material-ui/RaisedButton';

export default class Description extends Component {
  //Mise en place des propriétés initiales et des états
  constructor(props) {
    super(props);
    this.state={
      data:[],
      display:false,
      id:[],
    }
    this.loadAssociationFromServer = this.loadAssociationFromServer.bind(this);
    this.handleDisplay = this.handleDisplay.bind(this);
    this.handleEditDescription = this.handleEditDescription.bind(this);
  }
  //Chargement de l'association courante depuis Firebase
  loadAssociationFromServer() {
    let desc=[];
    let id=[];
    ref.child(this.props.association).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        desc=snapshot.val().description;
        id=snapshot.val().id;
      });
      this.setState({data: desc,id : id});
    });
  }
 //Une fois le composant chargé, on charge l'association courante depuis le serveur
  componentDidMount() {
    this.loadAssociationFromServer();
  }

  handleDisplay(){
    this.setState({display:!this.state.display});
    ref.child(this.props.association+'/'+this.state.id+'/').update({description:this.state.data});
  }

  handleEditDescription(e){
    const data = e.target.value;
    this.setState({
      data,
    });
  }

  render() {
    const style ={
      paperStyle :{
        padding:"10px",
        marginTop:"64px",
        overflowY:"auto",
        height:"250px"
      },
      titleStyle :{
        textAlign:"center"
      },
      description :{
        fontSize:"12px",
        color: "rgba(0, 0, 0, 0.541176)",
        textAlign:'justify',
        padding:"20px",
        lineHeight:"20px"
      }
    }

    return (
      <div>
        <Paper zDepth={2} style={style.paperStyle}>
          {this.props.admin && <IconButton onTouchTap={this.handleDisplay} style={{float:"right"}} >{ this.state.display ?  <Check/>: <ActionEdit/>}</IconButton>}
          <h4 style={style.titleStyle}>Description</h4>
          {this.state.display ? <TextField multiLine={true}
          rows={2} defaultValue={this.state.data} fullWidth={true} onChange={this.handleEditDescription}/> : <pre style={style.description}>{this.state.data}</pre>}
          {this.state.display}
        </Paper>
      </div>
    );
  }

}
