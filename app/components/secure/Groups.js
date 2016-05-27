/*
** Composant Groups fonctionnant en concordance avec la gestion des adhérents
**
*/
//Importation des éléments de Material-UI
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Mail from './subcomponents/mail/Mail';
import RaisedButton from 'material-ui/RaisedButton';
import React, {Component} from "react";
import {red500} from 'material-ui/styles/colors';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionEmail from 'material-ui/svg-icons/communication/email';
import ActionEdit from 'material-ui/svg-icons/editor/mode-edit';
import Subheader from 'material-ui/Subheader';

//initialisation de Firebase pour l'association
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);

export default class Groups extends Component{
  //Mise en place des propriétés initiales et des états
  constructor(props){
    super(props);
    this.state = {
      mails:[],
      openNewGroup:false,
      items:[],
      idFromAssociation:[],
      mailsChecked:[],
      groupName:"",
      listGroup:[],
      namesFromGroup:[],
      openListGroup:false,
      openDelete:false,
      openEdit:false,
      currentGroup:"",
      namesNotInGroup:[]
    };
    this.loadUsersAndIdFromAssociation=this.loadUsersAndIdFromAssociation.bind(this);
    this.handleNewGroup = this.handleNewGroup.bind(this);
    this.handleCloseNewGroup = this.handleCloseNewGroup.bind(this);
    this.handleCloseListGroup = this.handleCloseListGroup.bind(this);
    this.handleOpenListGroup = this.handleOpenListGroup.bind(this);
    this.handleGroupNameFieldChange = this.handleGroupNameFieldChange.bind(this);
    this.handleCloseDeleteGroup = this.handleCloseDeleteGroup.bind(this);
    this.handleOpenDeleteGroup = this.handleOpenDeleteGroup.bind(this);
    this.handleOpenEditGroup = this.handleOpenEditGroup.bind(this);
    this.handleCloseEditGroup = this.handleCloseEditGroup.bind(this);
    this.newGroup = this.newGroup.bind(this);
    this.checkItem = this.checkItem.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.editGroup = this.editGroup.bind(this);
    this.addToGroup = this.addToGroup.bind(this);
    this.removeFromGroup = this.removeFromGroup.bind(this);
  }
  //Chargement des utilisateus et des ID depuis Firebase de l'association courante
  loadUsersAndIdFromAssociation() {
    let emails = [];
    let id = [];
    ref.child(this.props.yourAssociation).limitToFirst(1).on('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        emails=snapshot.val().email;
        id=snapshot.val().id;
      });
      let listGroup=[];
      emails.map((item)=>{
        let groupId;
        for(groupId in item.group){
          if(listGroup.indexOf(item.group[groupId])==-1){
            listGroup.push(item.group[groupId]);
          }
        }
      });
      this.setState({
        items: emails,
        idFromAssociation: id,
        listGroup:listGroup
      });
    });
  }
  //On charge l'utilisateur depuis le groupe auquel il appartient
  loadUserFromGroup(group){
    let users = [];
    let usersNotInGroup = [];
    let listGroup=[];
    this.state.items.map((item)=>{
      let groupId;
      for(groupId in item.group){
        if(group == item.group[groupId]){
          users.push(item);
        }
      }
      if(users.indexOf(item)==-1){
        usersNotInGroup.push(item);
      }
    });
    this.setState({namesFromGroup:users, namesNotInGroup:usersNotInGroup});
  }
  //On affiche les fenêtres modales correspondantes aux fonctionnalités (ajout, modification et suppression)
  handleNewGroup(){
    this.setState({openNewGroup:true,mailsChecked:[]});
  }
  handleCloseNewGroup(){
    this.setState({openNewGroup:false,groupName:""});
  }
  handleOpenListGroup(e){
    this.loadUserFromGroup(e);
    this.setState({openListGroup:true});
  }
  handleCloseListGroup(){
    this.setState({openListGroup:false});
  }
  handleGroupNameFieldChange(e) {
    const groupName = e.target.value;
    this.setState({groupName,});
  }
  handleOpenDeleteGroup(e) {
    this.setState({openDelete:true,currentGroup:e});
  }
  handleCloseDeleteGroup(e) {
    this.setState({openDelete:false});
  }
  handleOpenEditGroup(e) {
    this.loadUserFromGroup(e);
    this.setState({openEdit:true,currentGroup:e});
  }
  handleCloseEditGroup(e) {
    this.setState({openEdit:false});
  }
  //Mise en place de la suppression de groupe dans Firebase et dans la liste
  deleteGroup(){
    this.state.items.map((item,i)=>{
      let groupId;
      let index;
      for(groupId in item.group){
        if(this.state.currentGroup == item.group[groupId]){
          index = groupId;
        }
      }
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+i+"/group/"+index).remove();
    });
    this.handleCloseDeleteGroup();
  }
  //Ajout des mails des utilisateurs appartenant aux groupes dans le champ destinataires
  handleMailGroup(e){
    let mails = [];
    let listGroup=[];
    this.setState({currentGroup:e});
    this.state.items.map((item)=>{
      let groupId;
      for(groupId in item.group){
        if(e == item.group[groupId]){
          mails.push(item.text);
        }
      }
    });
    this.setState({mails:mails});
  }
  //Ajout d'un nouveau groupe dans Firebase
  newGroup(){
    this.state.mailsChecked.map((index)=>{
      ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+index+"/group/").push(this.state.groupName);
    });
    this.handleCloseNewGroup();
  }
  //Edition du groupe sélectionné sur Firebase et sur la liste
  editGroup(){
    this.state.namesNotInGroup.map((item,i)=>{
      let groupId;
      let index = null;
      for(groupId in item.group){
        if(this.state.currentGroup == item.group[groupId]){
          index = groupId;
        }
      }
      if(index!=null){
        ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+this.state.items.indexOf(item)+"/group/"+index).remove();
      }
    });
    this.state.namesFromGroup.map((item,i)=>{
      let groupId;
      let index = null;
      for(groupId in item.group){
        if(this.state.currentGroup == item.group[groupId]){
          index = groupId;
        }
      }
      if(index==null){
        ref.child(this.props.yourAssociation+"/"+this.state.idFromAssociation+"/email/"+this.state.items.indexOf(item)+"/group/").push(this.state.currentGroup);
      }
    });
    this.handleCloseEditGroup();
  }
  //On charge les données une fois le composant chargé
  componentDidMount(){
    this.loadUsersAndIdFromAssociation();
  }
  //On supprime un utilisateur depuis un groupe
  removeFromGroup(e){
    let users = this.state.namesNotInGroup;
    let usersGroup = this.state.namesFromGroup;
    let index = this.state.namesFromGroup.indexOf(e);
    users.push(e);
    usersGroup.splice(index,1);
    this.setState({namesFromGroup:usersGroup});
  }
  //On ajoute un utilisateur dans un groupe
  addToGroup(e){
    let usersGroup = this.state.namesFromGroup;
    let users = this.state.namesNotInGroup;
    let index = this.state.namesNotInGroup.indexOf(e);
    usersGroup.push(e);
    users.splice(index,1);
    this.setState({namesNotInGroup:users,namesFromGroup:usersGroup});
  }
  //Dans l'édition de groupe, on passe d'un tableau "dans le groupe" à l'autre "pas dans le groupe"
  checkItem(e){
    if(this.state.mailsChecked.indexOf(e) >= 0){
      this.state.mailsChecked.splice(this.state.mailsChecked.indexOf(e),1);
    }else{
      this.state.mailsChecked.push(e);
    }
  }
  render() {
    const style= {
      marginTop:"64px",
    }
    //Différents boutons d'actions pour les fenêtres modales
    const actionsNewGroup = [
      <RaisedButton
        label="Valider"
        secondary={true}
        onTouchTap={this.newGroup}
        />,
      <RaisedButton
        label="Annuler"
        primary={true}
        onTouchTap={this.handleCloseNewGroup}
        />,
    ];
    const actionsDelete = [
      <RaisedButton
        label="Oui"
        secondary={true}
        onTouchTap={this.deleteGroup}
        />,
      <RaisedButton
        label="Non"
        primary={true}
        onTouchTap={this.handleCloseDeleteGroup}
        />,
    ];
    const actionsEdit = [
      <RaisedButton
        label="Valider"
        secondary={true}
        onTouchTap={this.editGroup}
        />,
      <RaisedButton
        label="Annuler"
        primary={true}
        onTouchTap={this.handleCloseEditGroup}
        />,
    ];
    //Connexion avec l'amazon S3
    const linkToS3 ="https://assaucisson.s3-us-west-2.amazonaws.com/";
    return (
      <div className="grid grid-pad">
        <Dialog
          bodyStyle={{overflowY:"auto"}}
          modal={false}
          open={this.state.openListGroup}
          onRequestClose={this.handleCloseListGroup}
          >
          Membres du groupe
          <List>
            {this.state.namesFromGroup.map((item,i)=>{
              let name = item.firstname + ' ' + item.lastname;


              let img = linkToS3+item.img;
              return <ListItem
                key={i}
                primaryText={name}
                disabled={true}
                leftAvatar={<Avatar src={img}/>}
                />
            })}
          </List>
        </Dialog>
        <Dialog
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDeleteGroup}
          actions={actionsDelete}
          >
          Supprimer le groupe : <b>{this.state.currentGroup}</b> ?
        </Dialog>
        <Dialog
          bodyStyle={{overflowY:"auto"}}
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEditGroup}
          actions={actionsEdit}
          >
          Editer le groupe : <b>{this.state.currentGroup}</b> ?
          <div className="grid grid-pad">
            <div className="col-1-2">
              <List>
                <Subheader>Pas dans le groupe</Subheader>

                {this.state.namesNotInGroup.map((item,i)=>{
                  let name = item.firstname + ' ' + item.lastname;
                  let img = linkToS3+item.img;
                  return <ListItem onTouchTap={(e)=>this.addToGroup(item)}
                    key={i}
                    primaryText={name}
                    leftAvatar={<Avatar src={img}/>}
                    />
                })}
              </List>
            </div>
            <div className="col-1-2">
              <List>
                <Subheader>Dans le groupe</Subheader>
                {this.state.namesFromGroup.map((item,i)=>{
                  let name = item.firstname + ' ' + item.lastname;
                  let img = linkToS3+item.img;
                  return <ListItem
                    onTouchTap={(e)=>this.removeFromGroup(item)}
                    key={i}
                    primaryText={name}
                    leftAvatar={<Avatar src={img}/>}
                    />
                })}
              </List>
            </div>
          </div>
        </Dialog>
        <Dialog
          modal={false}
          bodyStyle={{overflowY:"auto"}}
          open={this.state.openNewGroup}
          onRequestClose={this.handleCloseNewGroup}
          actions={actionsNewGroup}
          >
          <h2 style={{fontFamily:"Damion"}}>Nouveau Groupe</h2>
          <TextField
            id="groupName"
            type="text"
            value={this.state.groupName}
            floatingLabelText="Nom du groupe"
            onChange={this.handleGroupNameFieldChange}
            fullWidth={true}
            />
          <List>
            {this.state.items.map((item,i)=>{
              const name = item.firstname + " " + item.lastname + " - "+item.text;
              return <ListItem disabled={true}><Checkbox
                defaultChecked={false}
                label={name}
                key={i}
                onCheck={(e)=>this.checkItem(i)}
                /></ListItem>}
              )}
            </List>
          </Dialog>
          <div className="col-1-1" style={style}>
            <h1  style={{fontFamily:"Damion",textAlign:"center"}}>Groupes</h1>
            {this.props.you.admin && <div style={{textAlign:"center"}}><RaisedButton primary={true}  label="Nouveau Groupe" onTouchTap={this.handleNewGroup}/></div>}
            <Table
              bodyStyle={{overflowY:"auto",height:"200px"}}
              fixedHeader={true}
              fixedFooter={true}
              selectable={false}
              multiSelectable={false}>
              <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
                enableSelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>Nom du groupe</TableHeaderColumn>
                  {this.props.you.admin && <TableHeaderColumn>Actions</TableHeaderColumn>}
                </TableRow>
              </TableHeader>
              <TableBody
                displayRowCheckbox={false}
                showRowHover={true}>
                {this.state.listGroup.map((item,i)=>{
                  return <TableRow key={i}>
                    <TableRowColumn style={{cursor:"pointer"}} onTouchTap={(e)=>this.handleOpenListGroup(item)}>{item}</TableRowColumn>
                    <TableRowColumn>
                      { this.props.you.admin &&
                        <IconButton onTouchTap={(e)=>this.handleOpenEditGroup(item)}>
                          <ActionEdit className="material-icons"/>
                        </IconButton>
                      }
                      <IconButton onTouchTap={(e)=>this.handleMailGroup(item)}>
                        <ActionEmail className="material-icons"/>
                      </IconButton>
                      {this.props.you.admin &&
                        <IconButton onTouchTap={(e)=>this.handleOpenDeleteGroup(item)}>
                          <ActionDelete className="material-icons" color={red500}/>
                        </IconButton>
                      }
                    </TableRowColumn>}
                  </TableRow>
                })}
              </TableBody>
            </Table>
            <h2>Envoyer un email</h2>
            <Mail mails={this.state.mails} group={this.state.currentGroup}/>
          </div>
        </div>
      );
    }
  };
