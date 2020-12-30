import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { projectsServiceUrl } from '../util/constants';
import api from '../util/api';
import { AddOutlined, ArrowBack, Close, Delete, Edit, ExpandMore } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import moment from 'moment';
import TasksDialog from '../components/TasksDialog';
import { getUserData } from '../util/user';

class Projects extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      currentProject: null,
      projectToDelete: null,
      currentPhase: null,
      tasksDialogData: null,
      users: {},
      phases: {},
    };
  }

  componentDidMount() {
    this.loadProjects();
  }

  loadProjects = () => {
    api.get(`${projectsServiceUrl}/projects`, {}, {
      onSuccess: (r) => {
        this.setState({projects: r.data ? r.data : []});
      },
    });
  };

  loadPhases = projectId => {
    api.get(`${projectsServiceUrl}/projects/${projectId}/phases`, {}, {
      onSuccess: (r) => {
        this.setState(prevState => ({
          phases: {
            ...prevState.phases,
            [projectId]: r.data.sort((a, b) => (moment(a.deadline) > moment(b.deadline)) ? 1 : -1),
          },
        }));
      },
    });
  };

  loadUsers = projectId => {
    api.get(`${projectsServiceUrl}/projects/${projectId}/users`, {}, {
      onSuccess: (r) => {
        this.setState(prevState => ({
          users: {
            ...prevState.users,
            [projectId]: r.data,
          },
        }));
      },
    });
  };

  save = () => {
    const {currentProject} = this.state;

    if (currentProject?.id != null) {
      // update existing
      api.put(`${projectsServiceUrl}/projects/${currentProject.id}`, currentProject, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentProject: null,
          });
          this.loadProjects();
        },
      });
    } else {
      // create new item
      api.post(`${projectsServiceUrl}/projects`, currentProject, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentProject: null,
          });
          this.loadProjects();
        },
      });
    }
  };

  savePhase = () => {
    const {currentPhase} = this.state;

    if (currentPhase?.id != null) {
      // update existing
      api.put(`${projectsServiceUrl}/projects/${currentPhase.project_id}/phases/${currentPhase.id}`, currentPhase, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentPhase: null,
          });
          this.loadPhases(currentPhase.project_id);
        },
      });
    } else {
      // create new item
      api.post(`${projectsServiceUrl}/projects/${currentPhase.project.id}/phases`, currentPhase, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentPhase: null,
          });
          this.loadPhases(currentPhase.project.id);
        },
      });
    }
  };

  addUser = projectId => {
    let users = this.state.users[projectId] ?? [];
    users = users.map(u => u.user_id);
    users.push(getUserData().email);

    api.put(`${projectsServiceUrl}/projects/${projectId}/users`, users, {
      onSuccess: r => {
        // update users
        this.setState(prevState => ({
          users: {
            ...prevState.users,
            [projectId]: r.data,
          },
        }));
      },
    });
  };

  removeUser = projectId => {
    let users = this.state.users[projectId] ?? [];
    users = users.map(u => u.user_id);
    const email = getUserData().email
    users = users.filter(u => u !== email);

    api.put(`${projectsServiceUrl}/projects/${projectId}/users`, users, {
      onSuccess: r => {
        // update users
        this.setState(prevState => ({
          users: {
            ...prevState.users,
            [projectId]: r.data,
          },
        }));
      },
    });
  };


  deleteProject = () => {
    const {projectToDelete} = this.state;
    api.delete(`${projectsServiceUrl}/projects/${projectToDelete.id}`, {}, {
      onSuccess: r => {
        this.setState({
          projectToDelete: null,
        });
        this.loadProjects();
      },
    });
  };

  render() {
    const {currentProject, projectToDelete, currentPhase, tasksDialogData} = this.state;

    return <Container>
      <Box pt={4}>
        <Grid container direction='row' spacing={2}>
          <Grid item xs={12}>
            <Grid container direction='row' justify='space-between' alignItems='baseline'>
              <Grid item>
                <IconButton onClick={() => this.props.history.push('/')}><ArrowBack/></IconButton>
              </Grid>
              <Grid item>
                <h1>Projekti</h1>
              </Grid>
              <Grid item>
                <Button variant='contained' color='primary' onClick={() => this.setState({
                  currentProject: {
                    'name': '',
                    'description': '',
                  },
                })}>Nov projekt
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {this.state.projects.map(project => (
              <Accordion key={project.id} onChange={(e, isExpanded) => {
                if (isExpanded) {
                  this.loadPhases(project.id);
                  this.loadUsers(project.id);
                }
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMore/>}
                >
                  <Typography variant='h5'>{project.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container direction='row' alignItems='center' spacing={2}>
                    <Grid item style={{flexGrow: 1}}>
                      <Typography>
                        {project.description}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => this.setState({currentProject: project})}>
                        <Edit/>
                      </IconButton>
                      <IconButton onClick={() => this.setState({projectToDelete: project})}>
                        <Delete/>
                      </IconButton>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container direction='row' spacing={2} alignItems='baseline'>
                        <Grid item>
                          <Typography>Sodelujoči:</Typography>
                        </Grid>
                        {(this.state.users[project.id] ?? []).map(user => <Grid item key={user.user_id}>
                          <Tooltip title={user.user_id}>
                            <Avatar style={{
                            color: '#fff',
                            backgroundColor: '#3f50b5',
                          }}>{user.user_id ? user.user_id[0] : '?'}</Avatar>
                          </Tooltip>
                        </Grid>)}
                        <Grid item>
                          {
                            (this.state.users[project.id] ?? []).map(u => u.user_id).includes(getUserData().email) ?
                              <IconButton color='secondary'
                                          onClick={() => this.removeUser(project.id)}><Close/></IconButton>
                              : <IconButton color='secondary'
                                            onClick={() => this.addUser(project.id)}><AddOutlined/></IconButton>
                          }
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider/>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container justify='space-between'>
                        <Grid item>
                          <Typography variant='h6'>Faze</Typography>
                        </Grid>
                        <Grid item>
                          <Button variant='outlined' color='primary' onClick={() => this.setState({
                            currentPhase: {
                              name: '',
                              description: '',
                              deadline: moment().toISOString(),
                              project: project,
                            },
                          })}>Dodaj fazo</Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <List>
                        {(this.state.phases[project.id] ?? []).map(phase => <ListItem button
                                                                                      key={phase.id}
                                                                                      onClick={() => this.setState({
                                                                                        tasksDialogData: {
                                                                                          title: phase.name,
                                                                                          phaseId: phase.id,
                                                                                          projectId: project.id,
                                                                                        },
                                                                                      })}>
                            <ListItemText
                              primary={<React.Fragment>
                                {phase.name}
                                <Typography color='primary'>
                                  {moment(phase.deadline).format('DD. MM. YYYY')}
                                </Typography>
                              </React.Fragment>}
                              secondary={phase.description}
                            />
                            <ListItemSecondaryAction>
                              <Button onClick={() => this.setState({currentPhase: phase})}>
                                <Edit/>
                              </Button>
                              <Button>
                                <Delete/>
                              </Button>
                            </ListItemSecondaryAction>
                          </ListItem>,
                        )}
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </Box>
      {currentProject ?
        <Dialog maxWidth='xs' open={true} onClose={() => this.setState({currentProject: null})}>
          <DialogTitle>
            {currentProject.id != null ? 'Uredi Projekt' : 'Nov Projekt'}
          </DialogTitle>
          <DialogContent>
            <Grid container direction='row' spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='Ime'
                  value={currentProject.name}
                  onChange={e => this.setState(prevState => ({
                    currentProject: {
                      ...prevState.currentProject,
                      name: e.target.value,
                    },
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Opis'
                  value={currentProject.description}
                  onChange={e => this.setState(prevState => ({
                    currentProject: {
                      ...prevState.currentProject,
                      description: e.target.value,
                    },
                  }))}
                  multiline
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({currentProject: null})}>
              Prekliči
            </Button>
            <Button onClick={this.save}>
              {currentProject?.id ? 'Shrani' : 'Ustvari'}
            </Button>
          </DialogActions>
        </Dialog>
        : null}
      {currentPhase ?
        <Dialog maxWidth='xs' open={true} onClose={() => this.setState({currentPhase: null})}>
          <DialogTitle>
            {currentPhase.id != null ? 'Uredi fazo' : 'Ustvari fazo'}
          </DialogTitle>
          <DialogContent>
            <Grid container direction='row' spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='Ime'
                  value={currentPhase.name}
                  onChange={e => this.setState(prevState => ({
                    currentPhase: {
                      ...prevState.currentPhase,
                      name: e.target.value,
                    },
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Opis'
                  value={currentPhase.description}
                  onChange={e => this.setState(prevState => ({
                    currentPhase: {
                      ...prevState.currentPhase,
                      description: e.target.value,
                    },
                  }))}
                  multiline
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Rok"
                type="date"
                value={moment(currentPhase.deadline).format('YYYY-MM-DD')}
                onChange={e => {
                  this.setState(prevState => ({
                    currentPhase: {
                      ...prevState.currentPhase,
                      deadline: moment(e.target.value).toISOString(),
                    },
                  }));
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({currentPhase: null})}>
              Prekliči
            </Button>
            <Button onClick={this.savePhase}>
              {currentPhase?.id ? 'Shrani' : 'Ustvari'}
            </Button>
          </DialogActions>
        </Dialog>
        : null}
      {projectToDelete ?
        <ConfirmDialog onCancel={() => this.setState({projectToDelete: null})}
                       onConfirm={this.deleteProject}
                       open={true}
                       title='Izbriši projekt'
                       text='Ali si prepričan, da želiš izbrisati ta projekt?'
        /> : null}
      {tasksDialogData ?
        <TasksDialog
          onClose={() => this.setState({tasksDialogData: null})}
          projectId={tasksDialogData.projectId}
          phaseId={tasksDialogData.phaseId}
          title={tasksDialogData.title}
        />
        : null
      }
    </Container>;
  }
}

export default withRouter(Projects);