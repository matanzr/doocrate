import React, { Component } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getAuth } from 'src/auth';

import { getSelectedTask } from 'src/tasks';

import './task-view.css';
import Icon from '../icon';
import Textarea from 'react-textarea-autosize';

import Img from 'react-image'
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import Select from 'react-select';

export class TaskView extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      title: '',
      description: '',
      circle: '',
      defaultCircle: [
        { value: 'אור', label: 'אור' },
        { value: 'אמיר', label: 'אמיר'},
        { value: 'מיכאל', label: 'מיכאל'}
      ],
      label: [],
      creatorSpecialComments: '',
      communitySpecialComments: '',
      relevantContacts: '',
      assigneePhone: '',
      status: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleLabelChange = this.handleLabelChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static propTypes = {
    selectTask: PropTypes.func.isRequired,
    updateTask: PropTypes.func.isRequired,
    removeTask: PropTypes.func.isRequired,
    assignTask: PropTypes.func.isRequired,
    selectedTask: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    let { title, description, circle,
      label, creatorSpecialComments, communitySpecialComments,
      relevantContacts,
      assigneePhone, status, dueDate, createdDate } = nextProps.task;
    
    const labelAsArray = label ?
      (Object.keys(label).map( l => { return l })) : [];

    this.setState({
      title: title || '',
      description:description || '',
      circle:circle || '',
      label: labelAsArray || [],
      creatorSpecialComments:creatorSpecialComments || '',
      communitySpecialComments: communitySpecialComments || '',
      relevantContacts:relevantContacts || '',
      assigneePhone:assigneePhone || '',
      status: status || '',
      createdDate: createdDate || '',
      dueDate: dueDate || '',
    });
  }

  render() {
    const { task } = this.props;

    if(!task) {
      return(
        <div className="task-view g-row">
          <div className="g-col">
            <h1>&nbsp;</h1>
          </div>
        </div>
      );
    }

    const isTaskEmpty = !task.description &&
        !task.circle && !task.status;
    
    const isUserCreator = task.creator && task.creator.id == this.props.auth.id;

    return (
      <div className='task-view-container'>
        <div className='task-view-header'>

        {!task.assignee ? <button
          className='button button-small assign_task'
          onClick={()=>this.props.assignTask(task)}
          type='button'>קח אחריות על משימה זו</button> : 
          
          <div className='avatar-container'>
            <Img className='avatar' src={task.assignee.photoURL}/>
            <span>{task.assignee.name}</span>
          </div>}
            
          { isTaskEmpty && isUserCreator ?
          <button
            className='button delete_task'
            onClick={()=>this.props.removeTask(task)}
            type='button'>מחק משימה</button> : '' }
          
        </div>
        <div className='task-view'>
          <form onSubmit={this.handleSubmit} noValidate>
            {this.renderInput(task, 'title', 'שם המשימה')}
            {this.renderTextArea(task, 'description', 'תאור המשימה')}
            {this.props.isAdmin? 
              this.renderSelect(task, 'circle', 'מעגל', this.state.defaultCircle): ''}
            <div><Icon className='label' name='label_outline' /> {this.renderLabel()} </div>
            {this.renderTextArea(task, 'creatorSpecialComments', 'הערות מיוחדות מהיוצר')}
            {this.renderTextArea(task, 'communitySpecialComments', 'הערות מהקהילה')}
            {this.renderTextArea(task, 'relevantContacts', 'אנשי קשר רלוונטיים')}
            {this.renderInput(task, 'assigneePhone', 'טלפון ממלא המשימה')}
            {this.renderTextArea(task, 'status', 'סטטוס המשימה')}
            <input className='button button-small button-save' type="submit" value="שמור" />
          </form>
        </div>
      </div>
    );
  }
  
  renderSelect(task, fieldName, placeholder, options) {
    return (
      <Select
      name='circle-name'
      type='text'
      name={fieldName}
      value={this.state[fieldName]}
      placeholder={placeholder}
      ref={e => this[fieldName+'Input'] = e}
      onChange={(e) => { if (!e || !e.value) { return };
                this.setState({ [fieldName]: e.value}) }}
      options={options}
      onBlur={this.handleSubmit}
      clearable={false}/>
  );
  }

  renderInput(task, fieldName, placeholder) {
    return (
        <input
        className='changing-input'
        type='text'
        name={fieldName}
        value={this.state[fieldName]}
        placeholder={placeholder}
        ref={e => this[fieldName+'Input'] = e}
        onChange={this.handleChange}
        onBlur={this.handleSubmit} />
    );
  }

  renderTextArea(task, fieldName, placeholder) {
    return (
        <Textarea
        className='changing-input'
        name={fieldName}
        value={this.state[fieldName]}
        placeholder={placeholder}
        ref={e => this[fieldName+'Input'] = e}
        onChange={this.handleChange}
        onBlur={this.handleSubmit}/>
    );
  }

  renderLabel() {
    const showPlaceholder = !this.state.label || this.state.label.length == 0 ;
    return (
      <TagsInput className='react-tagsinput-changing'
      value={this.state.label}
      onChange={this.handleLabelChange}
      onlyUnique={true}
      addOnBlur={true}
      inputProps={{ placeholder: showPlaceholder ? 'הכנס תגיות' : ''}}
      />
    )
  }

  handleChange(e) {
    let fieldName = e.target.name;
    this.setState({
      [fieldName]: e.target.value
    });
  }

  handleLabelChange(label) {
    this.setState({label})
  }

  handleKeyUp(event) {
    if (event.keyCode === 13) {
      this.handleSubmit(event);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    let labelAsObject = this.arrayToObject(this.state.label);
    this.props.updateTask(this.props.task,
      {
        title: this.state.title,
        description: this.state.description,
        circle: this.state.circle,
        label: labelAsObject,
        creatorSpecialComments: this.state.creatorSpecialComments,
        communitySpecialComments: this.state.communitySpecialComments,
        relevantContacts: this.state.relevantContacts,
        assigneePhone: this.state.assigneePhone,
        status: this.state.status,
        dueDate: this.state.dueDate
      });
  }

  arrayToObject(array) {
    var result = {};
    for (var i = 0; i < array.length; ++i)
      result[array[i]] = true;
    return result;
  }
}

//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = createSelector(
  getSelectedTask,
  getAuth,
  (task, auth) => ({
    task,
    auth
  })
);

const mapDispatchToProps = Object.assign(
  {},
  // TODO: not sure what should be here
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskView);
