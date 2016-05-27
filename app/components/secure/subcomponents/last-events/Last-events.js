/**
** Last-Events.js
**
** Composant des evénements sur le dashboard.
** Gère la partie "futurs événements" de l'application dans le dashboard
**
**/

import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import moment from 'moment';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ActionInfo from 'material-ui/svg-icons/action/info';
import Firebase from 'firebase';
var forge = "https://gda.firebaseio.com/association";
var ref = new Firebase(forge);
import Subheader from 'material-ui/Subheader';

export default class LastEvents extends Component {
  constructor(props) {
    super(props);
    this.state={
      data:[],
    }
    this.loadEventsFromServer = this.loadEventsFromServer.bind(this);
  }
  //Chargement des événments depuis Firebase
  loadEventsFromServer() {
    let events = [];
    const refEvents = ref.child(this.props.eventsAssociation+'/calendar').orderByKey();
    refEvents.on('child_added', (dataSnapshot) => {
      events.push(dataSnapshot.val());
      this.setState({data: events});
    });
  }
  //On recharge les événements s'il y a des modifications de la taille de l'état Data
  componentDidUpdate(prevProps, prevState) {
    if(this.state.data.length!=prevState.data.length){
      this.loadEventsFromServer();
    }
  }
  //On charge les événements une fois le composant chargé
  componentDidMount(){
    this.loadEventsFromServer();
  }

  render() {
    const style ={
      paperStyle :{
        padding:"15px",
      },
      titleStyle :{
        textAlign:"center"
      }
    }

    return (
      <div>
        <Paper zDepth={2} style={style.paperStyle}>
          <h4 style={style.titleStyle}>Prochains évènements</h4>
          <List>
            <Subheader>Évènements</Subheader>
            {this.state.data.map((event,i) => {
              if(event.type=="event" && moment().diff(event.start, 'day',true)<=8){
                return <div key={i}>
                  <ListItem secondaryText={event.start} rightIcon={<ActionInfo />} primaryText={event.title} primaryTogglesNestedList={true} nestedItems={[
                      <ListItem
                        key={1}
                        primaryText={"Description : "+event.description}
                        />
                    ]}/>
                    <Divider inset={true}/>
                  </div>
                }
              })}
            </List>
            <List>
              <Subheader>Anniversaires</Subheader>
              {this.state.data.map((event,i) => {
                if(event.type=="birthday"){
                  return <div key={i}>
                    <ListItem secondaryText={event.start} rightIcon={<ActionInfo />} primaryTogglesNestedList={true} primaryText={event.title}
                      nestedItems={[
                        <ListItem
                          key={1}
                          primaryText={"Description : "+event.description}
                          />
                      ]}
                      />
                    <Divider inset={true}/>
                  </div>
                }
              })}
            </List>
          </Paper>
        </div>
      );
    }

  }
