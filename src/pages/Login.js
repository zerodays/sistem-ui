import React from 'react';
import { Box, Button, Card, Container, Grid, Link, TextField, Typography } from '@material-ui/core';
import api from '../util/api';
import { usersServiceUrl } from '../util/constants';
import { withRouter } from 'react-router-dom';
import { saveUserData } from '../util/user';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      errorMessage: '',
    });
  };

  isValid = () => {
    // is submit button active
    const {email, password} = this.state;
    return email !== '' && password !== '';
  };

  submit = event => {
    event.preventDefault();

    const {email, password} = this.state;

    api.post(`${usersServiceUrl}/authorize`, {
      email: email,
      password: password,
      type: 'password',
    }, {
      onSuccess: (r) => {
        saveUserData({
          token: r.data.access_token,
          email: email
        });
        this.props.history.push('/');
      },
      onError: (e) => this.props.history.push('/login'),
    });
  };

  render() {
    return <Grid
      container
      justify='center'
      direction='row'
      alignItems='center'
      style={{minHeight: '100vh'}}>
      <Grid item xs={12}>
        <Container maxWidth='xs'>
          <Grid container direction='row' spacing={2}>
            <Card>
              <Box px={4} py={6}>
                <form onSubmit={this.submit}>
                  <Grid container direction='row' spacing={2} justify='center'>
                    <Grid item key='title'>
                      <Typography variant='h4'>
                        Prijava
                      </Typography>
                    </Grid>
                    <Grid item key='do-not-have-account' xs={12}>
                      <Typography variant='body2'>
                        Nimate še računa za Sistem? <Link href='mailto:example@mail.com'>Kontakt.</Link>
                      </Typography>
                    </Grid>
                    <Grid item key='email' xs={12}>
                      <TextField
                        value={this.state.email}
                        label='Email'
                        onChange={this.handleChange('email')}
                        // type='email'
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item key='password' xs={12}>
                      <TextField
                        value={this.state.password}
                        label='Geslo'
                        type='password'
                        onChange={this.handleChange('password')}
                        required
                        fullWidth
                      />
                      <Box pt={1}>
                        <Link href='#'>
                          Pozabljeno geslo?
                        </Link>
                      </Box>
                    </Grid>

                    <Grid item key='submit' xs={12}>
                      <Button
                        disabled={!this.isValid()}
                        variant='contained'
                        type='submit'
                        color='primary'
                        style={{'width': '100%'}}>
                        Prijava
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Card>
          </Grid>
        </Container>
      </Grid>
    </Grid>;
  }
}

export default withRouter(Login);