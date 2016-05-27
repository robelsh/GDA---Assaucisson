/**
** Comment.js
**
** Composant de Commentaire.
** Gère la partie commentaire de l'application
**
**/

import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Colors from 'material-ui/styles/colors';
import {firebaseUtils} from '../../../../fb/users';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import PlusOne from 'material-ui/svg-icons/social/plus-one';
import ContentAdd from 'material-ui/svg-icons/content/add';
const _fbBase = new Firebase('https://gda.firebaseio.com/');
const _fbComments = _fbBase.child('association');
import Subheader from 'material-ui/Subheader';
import {darkBlack} from 'material-ui/styles/colors';

export default class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = {data: [], open: false};
    this.interval = null;
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handleCommentDelete = this.handleCommentDelete.bind(this);
    this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);
  }

  handleOpen() {
    this.setState({open: true});
  }
  handleClose() {
    this.setState({open: false});
  }

  loadCommentsFromServer() {
    let comments = [];
    _fbComments.child(this.props.commentsAssociation+'/comments').orderByKey().once('value', (dataSnapshot) => {
      dataSnapshot.forEach((snapshot) => {
        comments.push(Object.assign({id: snapshot.key()}, snapshot.val()));
      });
      this.setState({data: comments});
    });
  }

  handleCommentSubmit(comment) {
    var comments = this.state.data;
    comments.push(Object.assign({id: Date.now()}, comment));
    _fbComments.child(this.props.commentsAssociation+'/comments').push(comment);
  }

  handleCommentDelete(key) {
    var comments = this.state.data;
    comments = comments.filter((comment) => comment.id !== key);
    this.setState({data: comments});
    _fbComments.child(this.props.commentsAssociation+'/comments/'+key).remove();
    this.loadCommentsFromServer();
  }

  componentDidMount(){
    this.interval=setInterval(()=>{this.loadCommentsFromServer()},this.props.pollIntervalComments);
  }

  componentWillUnmount(){
    clearInterval(this.interval);
  }

  render() {
    const style ={
      paperStyle :{
        padding:"15px",
      },
      titleStyle :{
        textAlign:"center"
      }
    };
    return(
      <div>
        <Paper zDepth={2} style={style.paperStyle}>
          <h4 style={style.titleStyle}>Messagerie Instantanée</h4>
          <CommentList data={this.state.data} onCommentDelete={this.handleCommentDelete}/>
          <CommentForm onRequestClose={this.handleClose} onCommentSubmit={this.handleCommentSubmit} avatar={this.props.commentsAvatar} />
        </Paper>


      </div>
    );
  }
}

class CommentList extends Component {
  render() {
    let commentNodes = this.props.data.length!=0 ? this.props.data.map(comment => {
      return (
        <Comment topic={comment.topic} author={comment.author} src={comment.src} fbkey={comment.id} key={comment.id} onCommentDelete={this.props.onCommentDelete}>
          {comment.text}
        </Comment>
      );
    }) : <ListItem>Vous n'avez pas de message pour l'instant</ListItem>;
    return(
      <List style={{height:"200px",overflowY:"auto"}}>
        <Subheader>Du plus ancien au plus récent</Subheader>
        {commentNodes}
      </List>
    )
  }
}

class Comment extends Component {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    this.props.onCommentDelete(this.props.fbkey);
  }

  render() {
    const close = this.props.author==firebaseUtils.getCurrentUser() ? <IconButton onTouchTap={this.handleDelete}><NavigationClose/></IconButton>:null;

    return(
      <span>
        <ListItem
          leftAvatar={<Avatar src={this.props.src} />}
          primaryText={this.props.author}
          rightIconButton={close}
          secondaryText={

            <p>
              <span style={{color: darkBlack}}>{this.props.topic}</span> --
                {this.props.children.toString()}
              </p>
            }
            secondaryTextLines={2}
            />
          <Divider inset={true} />
        </span>
      )
    }
  }

  class CommentForm extends Component {
    constructor(props) {
      super(props)
      this.state = {
        topic:'',
        author: '',
        text: '',
        src: ''
      };
      this.handleTopicChange = this.handleTopicChange.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTopicChange(e) {
      this.setState({topic: e.target.value})
    }

    handleTextChange(e) {
      this.setState({text: e.target.value})
    }

    handleSubmit(e) {
      e.preventDefault();
      let topic = this.state.topic.trim();
      let text = this.state.text.trim();
      const linkToS3 ="https://assaucisson.s3-us-west-2.amazonaws.com/";

      if (!text || !topic) {
        return;
      }
      this.props.onCommentSubmit({
        topic: topic,
        author:firebaseUtils.getCurrentUser(),
        text: text,
        src:linkToS3+this.props.avatar
      });
      this.setState({
        topic:'',
        author: '',
        text: '',
        src:''
      });
    }

    render() {
      return(
        <form onSubmit={this.handleSubmit}>
          <TextField
            id="sujet"
            floatingLabelText="Quel sujet voulez-vous aborder ?"
            type="text"
            fullWidth={true}
            value={this.state.topic}
            onChange={this.handleTopicChange}
            />

          <TextField
            id="comment"
            floatingLabelText="Exprimez-vous..."
            type="text"
            fullWidth={true}
            value={this.state.text}
            onChange={this.handleTextChange}
            multiLine={true}
            rows={2}
            />
          <RaisedButton type="submit" label="Publier" onTouchTap={this.props.onRequestClose} primary={true}/>
        </form>
      )
    }
  }
