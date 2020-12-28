import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import api from '../util/api';
import { projectsServiceUrl } from '../util/constants';

class TasksDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: null,
    };
  }

  componentDidMount() {
    this.loadTasks();
  }

  loadTasks = () => {
    api.get(`${projectsServiceUrl}/projects/${this.props.projectId}/phases/${this.props.phaseId}/tasks`, {}, {
      onSuccess: (r) => {
        this.setState({
          tasks: r.data,
        });
      },
    });
  };

  save = () => {
    api.put(`${projectsServiceUrl}/projects/${this.props.projectId}/phases/${this.props.phaseId}/tasks`, this.state.tasks, {
      onSuccess: (r) => {
        this.setState({
          tasks: r.data,
        });
        this.props.onClose();
      },
    });
  };

  render() {
    const {onClose, title} = this.props;

    return <Dialog open={true} onClose={onClose}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <Grid container direction='row' spacing={2}>
          {(this.state.tasks ?? []).map((task, index) => <Grid item xs={12} key={index}>
            <Grid container direction='row' justify='space-between' spacing={1} alignItems='flex-end'>
              <Grid item>
                <TextField
                  label='Ime'
                  value={task.name}
                  onChange={e => this.setState(prevState => {
                    let tasks = prevState.tasks.slice();
                    tasks[index].name = e.target.value;

                    return {
                      tasks: tasks,
                    };
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label='Opis'
                  value={task.description}
                  onChange={e => this.setState(prevState => {
                    let tasks = prevState.tasks.slice();
                    tasks[index].description = e.target.value;

                    return {
                      tasks: tasks,
                    };
                  })}
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Checkbox
                  checked={task.completed}
                  color='primary'
                  onChange={e => this.setState(prevState => {
                    let tasks = prevState.tasks.slice();
                    tasks[index].completed = e.target.checked;
                    return {
                      tasks: tasks,
                    };
                  })}
                />
              </Grid>
            </Grid>
          </Grid>)}
          <Grid item xs={12}>
            <Box pt={2}>
              <Button color='primary' variant='contained' onClick={() => this.setState(prevState => {
                return {
                  tasks: [
                    ...prevState.tasks,
                    {
                      name: '',
                      description: '',
                      completed: false,
                    },
                  ],
                };
              })}>
                Dodaj nalogo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button key='cancel-button' onClick={onClose} color='primary'>
          Nazaj
        </Button>
        <Button
          key='confirm-button'
          onClick={this.save}
          color='primary'
          autoFocus>
          Shrani
        </Button>
      </DialogActions>
    </Dialog>;
  }
}

export default TasksDialog;
