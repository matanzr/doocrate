import React, { Component } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { authActions, getAuth } from 'src/auth';
import { getNotification, notificationActions } from 'src/notification';
import { getTaskFilter, getVisibleTasks, tasksActions } from 'src/tasks';
import { commentsActions } from 'src/comments';
import Notification from '../../components/notification';
import TaskFilters from '../../components/task-filters';
import TaskList from '../../components/task-list';
import TaskView from '../../components/task-view/task-view';
import Button from '../../components/button';
import classNames from 'classnames';
import LoaderUnicorn from '../../components/loader-unicorn/loader-unicorn';

import './tasks-page.css';

export class TasksPage extends Component {
  constructor() {
    super(...arguments);
    this.createNewTask = this.createNewTask.bind(this);
    this.isAdmin = this.isAdmin.bind(this);
    this.assignTaskToSignedUser = this.assignTaskToSignedUser.bind(this);
    this.selectTaskAndSetComments = this.selectTaskAndSetComments.bind(this);
  }

  static propTypes = {
    createTask: PropTypes.func.isRequired,
    dismissNotification: PropTypes.func.isRequired,
    filterTasks: PropTypes.func.isRequired,
    filterType: PropTypes.object.isRequired,
    loadTasks: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    notification: PropTypes.object.isRequired,
    removeTask: PropTypes.func.isRequired,
    assignTask: PropTypes.func.isRequired,
    tasks: PropTypes.instanceOf(List).isRequired,
    undeleteTask: PropTypes.func.isRequired,
    unloadTasks: PropTypes.func.isRequired,
    unloadComments: PropTypes.func.isRequired,
    updateTask: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.props.loadTasks();
    this.props.filterTasks(
      this.getFilterParam(this.props.location.search)
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.filterTasks(
        this.getFilterParam(nextProps.location.search)
      );
      this.selectTaskAndSetComments();
    }
  }

  componentWillUnmount() {
    this.props.unloadTasks();
  }

  getFilterParam(search) {
    const params = new URLSearchParams(search);
    let filterParams = {};
    filterParams.name = params.get('filter');
    filterParams.text = params.get('text');
    return filterParams;
  }

  renderNotification() {
    const { notification } = this.props;
    return (
      <Notification
        action={this.props.undeleteTask}
        actionLabel={notification.actionLabel}
        dismiss={this.props.dismissNotification}
        display={notification.display}
        message={notification.message}
      />
    );
  }

  createNewTask() {
    let creator = {
      id: this.props.auth.id,
      name: this.props.auth.name,
      email: this.props.auth.email,
      photoURL: this.props.auth.photoURL,
    }
    
    this.props.createTask({creator , title: `משימה חדשה של ${creator.name}`, created: new Date()});
    // TODO Select the new created task
  }

  isAdmin() {
    return false; //TODO
  }

  assignTaskToSignedUser(task) {
    this.props.assignTask(task, this.props.auth);
  }

  // TODO - Better handle it on the redux level and on each
  // call to select task - load the correct comments
  selectTaskAndSetComments(task) {
    const result = this.props.selectTask(task);
    this.props.unloadComments(); //TODO - not sure if needed here
    this.props.loadComments();
    return result;
  }

  render() {
    const isLoading = (!this.props.tasks || this.props.tasks.size <= 0);
    return (
      <div>
          <div className="g-col">
            <TaskFilters filter={this.props.filterType} />
            <Button
              className="button button-small add-task-button"
              onClick={ this.createNewTask }>
              הוסף משימה
            </Button>
          </div>
      
        <div className="g-row">
          <div className="g-col-60 g-col-xs-100">
            <TaskView 
              createTask={this.props.createTask}
              removeTask={this.props.removeTask}
              updateTask={this.props.updateTask}
              selectTask={this.selectTaskAndSetComments}
              isAdmin={false}
              assignTask={this.assignTaskToSignedUser}
              unloadComments={this.props.unloadComments}
              createComment={this.props.createComment}
            />
          </div>
          <div className="g-col-40 g-col-xs-100">
            <LoaderUnicorn isShow={ isLoading }/>
            <TaskList
              tasks={this.props.tasks}
              selectTask={this.selectTaskAndSetComments}
            />
          </div>

          {this.props.notification.display ? this.renderNotification() : null}
        </div>
      </div>
    );
  }
}


//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = createSelector(
  getNotification,
  getTaskFilter,
  getVisibleTasks,
  getAuth,
  (notification, filterType, tasks, auth) => ({
    notification,
    filterType,
    tasks,
    auth
  })
);

const mapDispatchToProps = Object.assign(
  {},
  tasksActions,
  commentsActions,
  notificationActions
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksPage);