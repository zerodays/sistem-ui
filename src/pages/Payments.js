import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import { paymentsServiceUrl } from '../util/constants';
import api from '../util/api';
import moment from 'moment';
import { ArrowBack, Delete, Edit } from '@material-ui/icons';
import CurrencyNumberFormat from '../components/CurrencyNumberFormat';
import { withRouter } from 'react-router-dom';
import { getUserData } from '../util/user';

class Payments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      payments: [],
      paymentsOverdue: [],
      currentPayment: null,
    };
  }

  componentDidMount() {
    this.loadPayments();
  }

  loadPayments = () => {
    api.get(`${paymentsServiceUrl}/payments`, {}, {
      onSuccess: (r) => {
        this.setState({payments: r.data});
      },
    });
    api.get(`${paymentsServiceUrl}/payments/overdue`, {}, {
      onSuccess: (r) => {
        this.setState({paymentsOverdue: r.data});
      },
    });
  };

  save = () => {
    const {currentPayment} = this.state;

    currentPayment.phase_id = parseInt(currentPayment.phase_id);

    if (currentPayment?.id != null) {
      // update existing
      api.put(`${paymentsServiceUrl}/payments/${currentPayment.id}`, currentPayment, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentPayment: null,
          });
          this.loadPayments();
        },
      });
    } else {
      // create new item
      api.post(`${paymentsServiceUrl}/payments`, currentPayment, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentPayment: null,
          });
          this.loadPayments();
        },
      });
    }
  };

  delete = id => {
    api.delete(`${paymentsServiceUrl}/payments/${id}`, {}, {
      onSuccess: r => {
        // reload all items
        this.loadPayments();
      },
    });
  };

  table = data => <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell><b>Id faze</b></TableCell>
          <TableCell><b>Znesek</b></TableCell>
          <TableCell><b>Rok plačila</b></TableCell>
          <TableCell><b>Plačano</b></TableCell>
          <TableCell size='small'/>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(payment => (
          <TableRow key={payment.id}>
            <TableCell>{payment.phase_id}</TableCell>
            <TableCell>{formatPrice(payment.amount)}</TableCell>
            <TableCell
              style={{color: (moment(payment.date_due) < moment()) && ! payment.payed ? 'red' : null}}>
              {moment(payment.date_due).format('D. M. YYYY')}
            </TableCell>
            <TableCell><Checkbox checked={payment.payed} disabled/></TableCell>
            <TableCell>
              <IconButton onClick={() => this.setState({currentPayment: payment})}>
                <Edit/>
              </IconButton>
              <IconButton onClick={() => this.delete(payment.id)}>
                <Delete/>
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>;

  render() {
    const {currentPayment} = this.state;

    return <Container>
      <Box pt={4}>
        <Grid container direction='row' spacing={2}>
          <Grid item xs={12}>
            <Grid container direction='row' justify='space-between' alignItems='baseline'>
              <Grid item>
                <IconButton onClick={() => this.props.history.push('/')}><ArrowBack/></IconButton>
              </Grid>
              <Grid item>
                <h1>Izplačila</h1>
              </Grid>
              <Grid item>
                <Button variant='contained' color='primary' onClick={() => this.setState({
                  currentPayment: {
                    'phase_id': 1,
                    'amount': 100,
                    'date_due': moment().toISOString(),
                  },
                })}>Dodaj plačilo
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}><Typography variant='h5'>Plačila za projekte</Typography></Grid>
          <Grid item xs={12}>
            {this.table(this.state.payments)}
          </Grid>
          <Grid item xs={12}><Typography variant='h5'>Zapadla plačila</Typography></Grid>
          <Grid item xs={12}>
            {this.table(this.state.paymentsOverdue)}
          </Grid>
        </Grid>
      </Box>
      {currentPayment ?
        <Dialog maxWidth='xs' open={true} onClose={() => this.setState({currentPayment: null})}>
          <DialogTitle>
            {currentPayment.id != null ? 'Uredi Plačilo' : 'Dodaj Plačilo'}
          </DialogTitle>
          <DialogContent>
            <Grid container direction='row' spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='ID faze'
                  value={currentPayment.phase_id.toString()}
                  onChange={e => this.setState(prevState => ({
                    currentPayment: {
                      ...prevState.currentPayment,
                      phase_id: e.target.value,
                    },
                  }))}
                  type='number'
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Znesek'
                  value={currentPayment.amount / 100}
                  onChange={e => this.setState(prevState => ({
                    currentPayment: {
                      ...prevState.currentPayment,
                      amount: e.target.value * 100,
                    },
                  }))}
                  fullWidth
                  InputProps={{
                    inputComponent: CurrencyNumberFormat,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Rok za plačilo"
                  type="date"
                  value={moment(currentPayment.date_due).format('YYYY-MM-DD')}
                  onChange={e => {
                    this.setState(prevState => ({
                      currentPayment: {
                        ...prevState.currentPayment,
                        date_due: moment(e.target.value).toISOString(),
                      },
                    }));
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Grid>
              {currentPayment.id ? <Grid item xs={12}>
                <Checkbox
                  checked={currentPayment.payed}
                  onChange={e => {
                    this.setState(prevState => ({
                      currentPayment: {
                        ...prevState.currentPayment,
                        payed: e.target.checked,
                      },
                    }));
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />Plačano
              </Grid> : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({currentPayment: null})}>
              Prekliči
            </Button>
            <Button onClick={this.save}>
              {currentPayment?.id ? 'Shrani' : 'Ustvari'}
            </Button>
          </DialogActions>
        </Dialog>
        : null}
    </Container>;
  }
}

function formatPrice(price) {
  return (price / 100).toLocaleString('de', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

export default withRouter(Payments);