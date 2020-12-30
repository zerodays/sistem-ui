import React from 'react';
import { getUserData, saveUserData } from '../util/user';
import { Redirect, withRouter } from 'react-router-dom';
import { Box, Button, Container, Grid } from '@material-ui/core';

function Home(props) {
  if (!getUserData().token) {
    // user is not logged in
    return <Redirect to='/login'/>;
  }

  return <Container>
    <Box p={4}>
      <Grid container spacing={2} justify='center'>
        <Grid item>
          <h1>Sistem</h1>
        </Grid>

        <Grid item xs={12} />

        <Grid item>
          {!getUserData().token ?
            <Button variant='contained' color='primary' style={{width: 200}}
                    onClick={() => props.history.push('/login')}>Prijava</Button> :
            <Button variant='contained' color='primary' style={{width: 200}}
                    onClick={() => {
                      saveUserData(null);
                      props.history.push('/login');
                    }}>Odjava</Button>}
        </Grid>

        <Grid item>
          <Button variant='contained' color='primary' style={{width: 200}}
                  onClick={() => props.history.push('/inventory')}>Inventar</Button>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' style={{width: 200}}
                  onClick={() => props.history.push('/projects')}>Projekti</Button>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' style={{width: 200}}
                  onClick={() => props.history.push('/meetings')}>Sestanki</Button>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' style={{width: 200}}
                  onClick={() => props.history.push('/payments')}>Izplačila</Button>
        </Grid>
      </Grid>
    </Box>
  </Container>;
}

export default withRouter(Home);