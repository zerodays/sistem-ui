import React, { Component, Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { CssBaseline, withStyles } from '@material-ui/core';
import { ErrorContext, parseApiError } from './util/errorHandler';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Meetings from './pages/Meetings';
import Payments from './pages/Payments';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
});

class App extends Component {

  handleApiError = (reason, history) => {
    // Function passed in react context, it is retrieved from context using
    // withErrorHandler higher order component. It should be called on axios
    // error. On critical error (i.e. no permission) user is redirected to
    // error page. If error is not critical just a dialog is shown.
    const redirect = route => {
      history.push(route);
    };

    parseApiError(reason, redirect);
  };

  appRouter = () => {
    const {classes} = this.props;
    return (
      <div style={{flexGrow: 1}}>
        <BrowserRouter className={classes.content}>
          <Suspense fallback={<div>Loading</div>}>
            <Switch>
              <Route path={'/login'} component={Login}/>
              <Route path={'/inventory'} component={Inventory}/>
              <Route path={'/projects'} component={Projects}/>
              <Route path={'/meetings'} component={Meetings}/>
              <Route path={'/payments'} component={Payments}/>

              <Route path={'/'} component={Home}/>
            </Switch>
          </Suspense>
        </BrowserRouter>
      </div>
    );
  };

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline/>
        <ErrorContext.Provider value={this.handleApiError}>
          {this.appRouter()}
        </ErrorContext.Provider>
      </div>
    );
  }
}

export default withStyles(styles)(App);
