/*
** Composant du tableau de bord comprenant la messagerie instantanée, les prochains événements, la description
**
*/

import React, {Component} from "react";
//Importation des composants material-ui
import CommentBox from './subcomponents/comments/Comments';
import LastEvents from './subcomponents/last-events/Last-events';
import Description from './subcomponents/description/Description';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';

export default class Panel extends Component{

  render() {
    const yourAssociation = this.props.yourAssociation;
    const yourAvatar = this.props.you.avatar;
    return (
      <div>
        <div className="grid grid-pad" style={{paddingBottom:"20px"}}>
          <div className="col-1-1">

            <Description association={yourAssociation} admin={this.props.you.admin}/>
          </div>
        </div>
        <Divider/>
        <div className="grid grid-pad" style={{paddingBottom:"20px"}}>
          <div className="col-1-2">
            <CommentBox pollIntervalComments={1200} commentsAssociation={yourAssociation} commentsAvatar={yourAvatar}/>
          </div>
          <div className="col-1-2">
            <LastEvents eventsAssociation={yourAssociation}/>
          </div>
        </div>
      </div>
    );
  }
}
