/*
** Composant de gestion des événements (activités et anniversaires)
** Nous avons utilisé le package suivant : https://github.com/dptoot/react-event-calendar
** Démo : http://dptoot.github.io/react-event-calendar/
*/

//Importation des compsants de Material-UI
import React, {Component} from "react";
import EventCalendar from 'react-event-calendar';
import Dialog from 'material-ui/Dialog';
import PlusOne from 'material-ui/svg-icons/social/plus-one';
import injectTapEventPlugin from 'react-tap-event-plugin';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/FlatButton';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
//On importe le CSS correspondant à Calednar.js
import './Calendar.css';
import areIntlLocalesSupported from 'intl-locales-supported';
import Firebase from 'firebase';
import Checkbox from 'material-ui/Checkbox';
import {firebaseUtils} from '../../fb/users';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
//initialisation de Firebase pour l'association courante
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);

//Composant parent du calendrier avec les propriétés liés à l'interval de temps et l'association courante
export default class Calendar extends Component{

  render() {
    return(
      <Events pollIntervalEvents={1000} eventsAssociation={this.props.yourAssociation} you={this.props.you}/>
    );
  }
}
//Validation de la date dans l'input et dans le calendrier
export function formatDate(date){
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth()+1).toString();
  const dd = date.getDate().toString();
  return `${yyyy}-${(mm[1]?mm:"0"+mm[0])}-${(dd[1]?dd:"0"+dd[0])}`;
}

//Sous composant de Calendar permettant d'ajouter des événments
class Events extends Component{
  //Mise en palce des états et des propriétés initiales
  constructor(props) {
    super(props);
    this.state = {
      moment: moment(Date.now()),
      data: [],
      birthdayEvents: [],
      title: "",
      titleMessage: "",
      descriptionMessage:"",
      description:"",
      endDate: null,
      startDate: null,
      open: false,
      message: "",
      currentData :[],
      participants:[],
      checkbox:false,
      openDelete:null,
      openInfos:null
    };
    this.interval = null;
    this.generatePDF = this.generatePDF.bind(this);
    this.getState = this.getState.bind(this);
    this.getHumanDate = this.getHumanDate.bind(this);
    this.handleOpen= this.handleOpen.bind(this);
    this.handleClose= this.handleClose.bind(this);
    this.handleOpenDelete= this.handleOpenDelete.bind(this);
    this.handleCloseDelete= this.handleCloseDelete.bind(this);
    this.handleStartDateFieldChange = this.handleStartDateFieldChange.bind(this);
    this.handleEndDateFieldChange = this.handleEndDateFieldChange.bind(this);
    this.handleTitleFieldChange = this.handleTitleFieldChange.bind(this);
    this.handleDescriptionFieldChange = this.handleDescriptionFieldChange.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
    this.handleEventMouseOver = this.handleEventMouseOver.bind(this);
    this.handleEventMouseOut = this.handleEventMouseOut.bind(this);
    this.loadEventsFromServer = this.loadEventsFromServer.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.handleOpenInfos = this.handleOpenInfos.bind(this);
    this.participation = this.participation.bind(this);
    this.handleCloseInfos = this.handleCloseInfos.bind(this);
  }
  //Génération du PDF avec jspdf (voir Members pour le lien vers la librairie)
  generatePDF(){
    this.setState({
      generating:true,
    })
  }
  generatePDFFile(){
    let self = this;
    let doc = new jsPDF('landscape');
    doc.fromHTML(document.getElementById("calendar"),40,40,{"width":150},function(){
      doc.save("calendrier.pdf");
      self.setState({
        generating:false,
      })
    });
  }
  //Chargement des événements depuis Firebase
  loadEventsFromServer() {
    let events = [];
    let refEvents = ref.child(this.props.eventsAssociation+'/calendar').orderByChild('type').equalTo('event');
    refEvents.once('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        events.push({
          id:snapshot.key(),
          title: snapshot.val().title,
          start: snapshot.val().start,
          participation:snapshot.val().participation,
          end: snapshot.val().end,
          description: snapshot.val().description,
          type:"event",
        });
      });
      this.setState({data: events});
    });
  }

  //Chargement des anniversaires depuis Firebase
  loadBirthdayFromServer(){
    let birthdayEvents = [];
    let refBirthday = ref.child(this.props.eventsAssociation+'/calendar').orderByChild('type').equalTo('birthday');
    refBirthday.once('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        let monthAndDay = snapshot.val().start.substring(5,10);
        let newDate = `${this.state.moment.year()}-${monthAndDay}`;
        birthdayEvents.push({
          id:snapshot.key(),
          title: snapshot.val().title,
          eventClasses: "event-birthday",
          participation:snapshot.val().participation,
          start: newDate,
          end: newDate,
          description: snapshot.val().description,
          type:"birthday",
        });
      });
      this.setState({ birthdayEvents });
    });
  }

//Changement de State par l'intermédiaire des informations entrées dans les input de la fenêtre modale d'ajout d'événements
  handleStartDateFieldChange(e, date) {
    this.setState({
      startDate:date
    });
  }
  handleEndDateFieldChange(e, date){
    this.setState({
      endDate:date
    });
  }
  handleTitleFieldChange(e){
    this.setState({
      title:e.target.value
    });
  }
  handleDescriptionFieldChange(e){
    this.setState({
      description:e.target.value
    });
  }
  handleEventMouseOver(target, data) {
    console.log("coucou");
  }

  handleEventMouseOut() {
    console.log("coucou");
  }

  handleNextMonth() {
    this.setState({
      moment: this.state.moment.add(1, 'M'),
    });
    this.loadBirthdayFromServer();
  }

  handlePreviousMonth() {
    this.setState({
      moment: this.state.moment.subtract(1, 'M'),
    });
    this.loadBirthdayFromServer();
  }

  handleToday() {
    this.setState({
      moment: moment(),
    });
    this.loadBirthdayFromServer();
  }

  handleEventClick(e, data) {
    let item;
    let participants =[];
    if(data.participation != undefined){
      for(item in data.participation){
        participants.push(data.participation[item]);
        if(data.participation[item].indexOf(firebaseUtils.getCurrentUser()) >-1){
          this.setState({
            checkbox : true,
          });
        }
      }
      this.setState({
        participants:participants
      });
    }else {
      this.setState({
        checkbox : false,
        participants:[]
      });
    }
    this.setState({
      currentData : data,
    });
    this.handleOpenInfos();
  }
  getState(now) {
    this.state = {
      moment: now
    };
  }
  confirmDelete(e){
    ref.child(this.props.eventsAssociation+'/calendar/'+this.state.currentData.id).remove();
    this.handleCloseDelete();
  }
  getHumanDate() {
    moment.locale('fr');
    return [moment.months('MM', this.state.moment.month()), this.state.moment.year(), ].join(' ');
  }
  handleOpen() {
    this.setState({
      open:true
    });
  }
  handleClose(){
    this.setState({
      open:false
    });
  }
  handleOpenDelete() {
    this.setState({
      openDelete:true
    });
  }
  handleCloseDelete(){
    this.setState({
      openDelete:false,
      openInfos:false
    });
  }
  handleOpenInfos(){
    this.setState({
      openInfos:true
    });
  }
  handleCloseInfos(){
    this.setState({
      openInfos:false
    });
  }
  participation(e){
    let participants = this.state.participants;
    let index;
    let item;
    this.setState({
      checkbox:!this.state.checkbox,
    });
    for(item in this.state.currentData.participation){
      if(this.state.currentData.participation[item].indexOf(firebaseUtils.getCurrentUser()) >-1){
        index = item;
      }
    }
    this.state.checkbox ? participants.splice(participants.indexOf(firebaseUtils.getCurrentUser()),1):participants.push(firebaseUtils.getCurrentUser());
    this.setState({participants:participants});
    this.state.checkbox ? ref.child(this.props.eventsAssociation+'/calendar/'+this.state.currentData.id+"/participation/"+index).remove() : ref.child(this.props.eventsAssociation+'/calendar/'+this.state.currentData.id+"/participation").push(firebaseUtils.getCurrentUser());
  }
  handleSubmit(e){
    e.preventDefault();
    let startDate = formatDate(this.state.startDate);
    let endDate = formatDate(this.state.endDate);
    ref.child(this.props.eventsAssociation+'/calendar').push({
      title: this.state.title,
      start: startDate,
      end: endDate,
      description: this.state.description,
      type:"event",
    });
  }

  componentDidMount() {

    this.interval=setInterval(()=>{
      this.loadEventsFromServer();
      this.loadBirthdayFromServer();
    },this.props.pollIntervalEvents);
  }
  componentDidUpdate(prevState){
    if (this.state.generating){
      this.generatePDFFile();
    }
  }
  componentWillUnmount(){
    clearInterval(this.interval);
  }
  render() {
    let newData = this.state.data.concat(this.state.birthdayEvents);
    let DateTimeFormat;
    if (areIntlLocalesSupported('fr')) {
      DateTimeFormat = global.Intl.DateTimeFormat;
    }
    const style={
      divStyle :{
        textAlign:"center",
        padding:"15px",
        marginTop:'64px'
      }
    }
    const actionsInfos = [
      <RaisedButton
        label="Valider"
        onTouchTap={this.handleCloseInfos}
        />,
      <RaisedButton
        label="Supprimer"
        secondary={true}
        disabled={!this.props.you.admin}
        onTouchTap={this.handleOpenDelete}
        />,
      <RaisedButton
        label="Annuler"
        primary={true}
        onTouchTap={this.handleCloseInfos}
        />,
    ];
    const actionsDelete = [
      <RaisedButton
        label="Valider"
        secondary={true}
        onTouchTap={this.confirmDelete}
        />,
      <RaisedButton
        label="Annuler"
        primary={true}
        onTouchTap={this.handleCloseDelete}
        />,
    ];
    let adminAddEvent;
    if(this.props.you.admin){
      adminAddEvent = <RaisedButton label="événement" style={{marginBottom:"15px"}} icon={<PlusOne />} primary={true} onTouchTap={this.handleOpen}/>;
    }
    let calendar;
    if(this.state.generating){
      calendar=<div id="calendar">
        <table>
          <colgroup>
            <col width="20%"/>
            <col width="20%"/>
            <col width="20%"/>
            <col width="20%"/>
          </colgroup>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Date de début</th>
              <th>Date de fin</th>
            </tr>
          </thead>
          <tbody>
            {newData.map((item)=>{
              return <tr>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.start}</td>
                <td>{item.end}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    }else{
      calendar=<RaisedButton label="Générer un document PDF" secondary={true} onTouchTap={this.generatePDF}/>
    }
    let participation = false;
    if(this.state.currentData.participation != null){
      participation = true;
    }
    return (
      <div>
        <div className="col-1-1" style={style.divStyle}>
          <h1 style={{fontFamily:"Damion"}}>Événements</h1>
          {adminAddEvent}
          {calendar}
          <br/>
          <FlatButton label="&lt;" onTouchTap={()=>this.handlePreviousMonth()}/>
          <FlatButton label="Aujourd'hui" onTouchTap={()=>this.handleToday()}/>
          <FlatButton label="&gt;" onTouchTap={()=>this.handleNextMonth()}/>
          <h4>{this.getHumanDate()}</h4>
          <EventCalendar
            ref={(component)=>this.eventCalendar=component}
            month={this.state.moment.month()}
            year={this.state.moment.year()}
            events={newData}
            onEventClick={this.handleEventClick}
            onEventMouseOver={this.handleEventMouseOver}
            onEventMouseOut={this.handleEventMouseOut}
            />
        </div>
        <Dialog
          modal={false}
          bodyStyle={{overflowY:"auto"}}
          open={this.state.openInfos}
          onRequestClose={this.handleCloseInfos}
          actions={actionsInfos}
          >
          <div className="grid-pad">
            <div className="col-1-2">
              <h4>{this.state.currentData.title} : {this.state.currentData.description}</h4> <p>du {this.state.currentData.start} au {this.state.currentData.end}</p>
              <Checkbox
                label="Participer"
                defaultChecked={this.state.checkbox}
                onCheck={this.participation}
                />
            </div>
            <div className="col-1-2">
              <List>
                <Subheader>Participants</Subheader>
                {this.state.participants.map((item)=>{
                  return <ListItem disabled={true}>{item}</ListItem>
                })}
              </List>
            </div>
          </div>
        </Dialog>
        <Dialog
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete}
          actions={actionsDelete}
          >Confirmer la suppression de l'événement ?</Dialog>
        <Dialog
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          >
          <h2 style={{fontFamily:"Damion"}}>Ajouter un événement</h2>
          <form onSubmit={(e)=>this.handleSubmit(e)}>
            <DatePicker
              value={this.state.startDate}
              onChange={this.handleStartDateFieldChange}
              hintText="Date de Début"
              fullWidth={true}
              DateTimeFormat={DateTimeFormat}
              okLabel="ok"
              cancelLabel="Annuler"
              formatDate={(value)=>moment(value).format("dddd Do MMM YYYY")}
              firstDayOfWeek={1}
              locale="fr"
              />
            <DatePicker
              value={this.state.endDate}
              onChange={this.handleEndDateFieldChange}
              hintText="Date de Fin"
              fullWidth={true}
              DateTimeFormat={DateTimeFormat}
              okLabel="ok"
              cancelLabel="Annuler"
              formatDate={(value)=>moment(value).format("dddd Do MMM YYYY")}
              firstDayOfWeek={1}
              locale="fr"
              />
            <TextField
              id="title"
              floatingLabelText="Titre de l'évènement"
              type="text"
              fullWidth={true}
              value={this.state.title}
              onChange={this.handleTitleFieldChange}
              />
            <TextField
              id="description"
              floatingLabelText="description de l'évènement"
              type="text"
              fullWidth={true}
              value={this.state.description}
              onChange={this.handleDescriptionFieldChange}
              />
            <RaisedButton type="submit" onTouchTap={this.handleClose} label="Valider" primary={true}/>
          </form>
        </Dialog>
      </div>
    );
  }
}
