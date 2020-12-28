import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@material-ui/core';
import { fileUploadServiceUrl, meetingsServiceUrl } from '../util/constants';
import api from '../util/api';
import moment from 'moment';
import { ArrowBack, Close, CloudUpload, Delete, Description, ExpandMore } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import fileDownload from 'js-file-download';

class Meetings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      changed: {},
      newMeeting: null,
      meetingIdToDelete: null,
      uploading: false,
    };
  }

  componentDidMount() {
    this.loadMeetings();
  }

  loadMeetings = () => {
    // Example URL where microservices work together
    api.get(`${meetingsServiceUrl}/meetings/by_project`, {}, {
      onSuccess: (r) => {
        this.setState({
          projects: r.data.map(project => {
            project.meetings = project.meetings.sort((a, b) => (moment(a.scheduled) > moment(b.scheduled)) ? 1 : -1);
            return project;
          }),
        });
      },
    });
  };

  save = (projectIndex, meetingIndex) => {
    let meeting = this.state.projects[projectIndex].meetings[meetingIndex];
    api.put(`${meetingsServiceUrl}/meetings/${meeting.id}`, meeting, {
      onSuccess: r => this.setState(prevState => {
        let c = prevState.changed;
        c[projectIndex + ',' + meetingIndex] = false;
        return {changed: c};
      }),
    });
  };

  addMeeting = () => {
    api.post(`${meetingsServiceUrl}/meetings`, this.state.newMeeting, {
      onSuccess: r => {
        this.setState({newMeeting: null});
        this.loadMeetings();
      },
    });
  };

  deleteMeeting = () => {
    api.delete(`${meetingsServiceUrl}/meetings/${this.state.meetingIdToDelete}`, {}, {
      onSuccess: r => {
        this.setState({
          meetingIdToDelete: null,
        });
        this.loadMeetings();
      },
    });
  };

  uploadFile = (files, projectIndex, meetingIndex) => {
    if (files == null || files.length === 0) {
      return;
    }
    let file = files[0];

    this.setState({
      uploading: true,
    });

    let formData = new FormData();
    formData.append('file', file);

    api.post(`${fileUploadServiceUrl}/files`, formData, {
      onSuccess: r => {
        this.setState(prevState => {
          let p = prevState.projects.slice();

          // weird problems, sometimes file was added twice
          p[projectIndex].meetings[meetingIndex].files = [...(new Set([
            ...p[projectIndex].meetings[meetingIndex].files,
            r.data.file_id]))];

          return {projects: p, uploading: false};
        });
        this.save(projectIndex, meetingIndex);
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  downloadFile = filename => {
    api.get(`${fileUploadServiceUrl}/files/${filename}`, {}, {
      onSuccess: r => {
        // first 32 chars of name are from uuid
        fileDownload(r.data, filename.slice(32));
      }
    });
  }

  render() {
    const {newMeeting} = this.state;

    return <Container>
      <Box pt={4}>
        <Grid container direction='row' spacing={2}>
          <Grid item xs={12}>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item>
                <IconButton onClick={() => this.props.history.push('/')}><ArrowBack/></IconButton>
              </Grid>
              <Grid item>
                <h1>Sestanki</h1>
              </Grid>
              <Grid item/>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container direction='row' spacing={4}>
              {this.state.projects.map((project, projectIndex) => <Grid item xs={12} key={project.id}>
                <Grid container direction='row' spacing={2}>
                  <Grid item xs={12}>
                    <Grid container alignItems='baseline' spacing={2}>
                      <Grid item>
                        <Typography variant='h5'>{project.name}</Typography>
                      </Grid>
                      <Grid item>
                        ({project.meetings.length + ' '}
                        {['sestankov', 'sestanek', 'sestanka', 'sestanki', 'sestanki', 'sestankov'][Math.min(project.meetings.length, 5)]})
                      </Grid>
                      <Grid item style={{'flexGrow': 1}}/>
                      <Grid item>
                        <Button variant='contained' color='primary' onClick={() => this.setState({
                          newMeeting: {
                            scheduled: moment().toISOString(),
                            project_id: project.id,
                            description: '',
                            files: [],
                          },
                        })}>
                          Dodaj sestanek
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    {project.meetings.map((meeting, meetingIndex) => <Accordion key={meeting.id}>
                      <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography>
                          Sestanek <b>{moment(meeting.scheduled).format('DD. MM. YYYY')}</b>
                          <IconButton
                            onClick={() => this.setState({meetingIdToDelete: meeting.id})}><Delete/></IconButton>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container direction='row' spacing={2}>
                          <Grid item xs={12}><Typography>Zapisnik:</Typography></Grid>
                          <Grid item xs={12}>
                            <TextField
                              value={meeting.description}
                              variant='outlined'
                              rowsMax={10}
                              rows={6}
                              onChange={e => this.setState(prevState => {
                                let p = prevState.projects.slice();
                                let c = prevState.changed;
                                p[projectIndex].meetings[meetingIndex].description = e.target.value;
                                c[projectIndex + ',' + meetingIndex] = true;
                                return {projects: p, changed: c};
                              })}
                              multiline
                              fullWidth
                            />
                          </Grid>
                          {this.state.changed[projectIndex + ',' + meetingIndex] ? <Grid item xs={12}>
                            <Grid container justify='flex-end'>
                              <Grid item>
                                <Button variant='contained' color='primary'
                                        onClick={() => this.save(projectIndex, meetingIndex)}>
                                  Shrani
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid> : null}
                          <Grid item xs={12}><Typography>Priloge:</Typography></Grid>
                          <Grid item xs={12}><Grid container direction='row' spacing={3}>
                            {meeting.files.map((filename, index) => <Grid item key={filename}>
                              <Button color='primary' onClick={() => this.downloadFile(filename)}>
                                <Description/>
                                <Box pl={2}>{filename.slice(32)}</Box>
                              </Button>
                              <IconButton onClick={e => this.setState(prevState => {
                                let p = prevState.projects.slice();
                                let c = prevState.changed;
                                p[projectIndex].meetings[meetingIndex].files.splice(index, 1);
                                c[projectIndex + ',' + meetingIndex] = true;
                                return {projects: p, changed: c};
                              })}><Close color='inherit'/></IconButton>
                            </Grid>)}
                            <Grid item>
                              <label htmlFor={`upload-file-${meeting.id}`}>
                                <input
                                  id={`upload-file-${meeting.id}`}
                                  style={{display: 'none'}}
                                  type="file"
                                  onChange={e => this.uploadFile(e.target.files, projectIndex, meetingIndex)}
                                />
                                <Button component="span">
                                  <CloudUpload/>
                                  <Box pl={2}>Naloži</Box>
                                </Button>
                              </label>
                            </Grid>
                          </Grid></Grid>

                        </Grid>
                      </AccordionDetails>
                    </Accordion>)}
                  </Grid>
                </Grid>
              </Grid>)}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      {newMeeting ? <Dialog maxWidth='xs' open={true} onClose={() => this.setState({newMeeting: null})}>
        <DialogTitle>Nov sestanek</DialogTitle>
        <DialogContent>
          <Grid container direction='row' spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Datum"
                type="date"
                value={moment(newMeeting.scheduled).format('YYYY-MM-DD')}
                onChange={e => {
                  this.setState(prevState => ({
                    newMeeting: {
                      ...prevState.newMeeting,
                      scheduled: moment(e.target.value).toISOString(),
                    },
                  }));
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({newMeeting: null})}>
            Prekliči
          </Button>
          <Button onClick={this.addMeeting}>
            Ustvari
          </Button>
        </DialogActions>
      </Dialog> : null}
      {this.state.meetingIdToDelete ?
        <ConfirmDialog onCancel={() => this.setState({meetingIdToDelete: null})}
                       onConfirm={this.deleteMeeting}
                       open={true}
                       title='Izbriši sestanek'
                       text='Ali si prepričan, da želiš izbrisati ta sestanek?'
        /> : null}
      {this.state.uploading ? <Backdrop open={true} style={{zIndex: 1000}}>
        <CircularProgress color='primary'/>
      </Backdrop> : null}
    </Container>;
  }
}

export default withRouter(Meetings);