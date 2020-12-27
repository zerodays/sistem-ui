import React from 'react';
import {
  Box,
  Button,
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
} from '@material-ui/core';
import { inventoryServiceUrl } from '../util/constants';
import api from '../util/api';
import moment from 'moment';
import { Add, ArrowBack, Edit } from '@material-ui/icons';
import CurrencyNumberFormat from '../components/CurrencyNumberFormat';
import { withRouter } from 'react-router-dom';

class Inventory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      currentItem: null,
    };
  }

  componentDidMount() {
    this.loadItems();
  }

  loadItems = () => {
    api.get(`${inventoryServiceUrl}/items`, {}, {
      onSuccess: (r) => {
        this.setState({items: r.data.reverse()});
      },
    });
  };

  save = () => {
    const {currentItem} = this.state;

    if (currentItem?.ID != null) {
      // update existing
      api.put(`${inventoryServiceUrl}/items/${currentItem.ID}`, currentItem, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentItem: null,
          });
          this.loadItems();
        },
      });
    } else {
      // create new item
      api.post(`${inventoryServiceUrl}/items`, currentItem, {
        onSuccess: r => {
          // reload all items
          this.setState({
            currentItem: null,
          });
          this.loadItems();
        },
      });
    }
  };

  render() {
    const {currentItem} = this.state;

    return <Container>
      <Box pt={4}>
        <Grid container direction='row' spacing={2}>
          <Grid item xs={12}>
            <Grid container direction='row' justify='space-between' alignItems='baseline'>
              <Grid item>
                <IconButton onClick={() => this.props.history.push('/')}><ArrowBack/></IconButton>
              </Grid>
              <Grid item>
                <h1>Inventar</h1>
              </Grid>
              <Grid item>
                <Button variant='contained' color='primary' onClick={() => this.setState({
                  currentItem: {
                    'Name': '',
                    'Description': '',
                    'Price': 100,
                    'DatePurchased': moment().toISOString(),
                  },
                })}>
                  <Add/> Dodaj
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Ime</b></TableCell>
                    <TableCell><b>Opis</b></TableCell>
                    <TableCell><b>Cena</b></TableCell>
                    <TableCell><b>Datum nakupa</b></TableCell>
                    <TableCell size='small'/>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.items.map(item => (
                    <TableRow key={item.ID}>
                      <TableCell>{item.Name}</TableCell>
                      <TableCell>{item.Description}</TableCell>
                      <TableCell>{formatPrice(item.Price)}</TableCell>
                      <TableCell>{moment(item.DatePurchased).format('D. M. YYYY')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => this.setState({currentItem: item})}>
                          <Edit/>
                        </IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
      {currentItem ?
        <Dialog maxWidth='xs' open={true} onClose={() => this.setState({currentItem: null})}>
          <DialogTitle>
            {currentItem.ID != null ? 'Uredi Predmet' : 'Dodaj Predmet'}
          </DialogTitle>
          <DialogContent>
            <Grid container direction='row' spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='Ime'
                  value={currentItem.Name}
                  onChange={e => this.setState(prevState => ({
                    currentItem: {
                      ...prevState.currentItem,
                      Name: e.target.value,
                    },
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Opis'
                  value={currentItem.Description}
                  onChange={e => this.setState(prevState => ({
                    currentItem: {
                      ...prevState.currentItem,
                      Description: e.target.value,
                    },
                  }))}
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Cena'
                  value={currentItem.Price / 100}
                  onChange={e => this.setState(prevState => ({
                    currentItem: {
                      ...prevState.currentItem,
                      Price: e.target.value * 100,
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
                  label="Datum nakupa"
                  type="date"
                  value={moment(currentItem.DatePurchased).format('YYYY-MM-DD')}
                  onChange={e => {
                    this.setState(prevState => ({
                      currentItem: {
                        ...prevState.currentItem,
                        DatePurchased: moment(e.target.value).toISOString(),
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
            <Button onClick={() => this.setState({currentItem: null})}>
              Prekliči
            </Button>
            <Button onClick={this.save}>
              {currentItem?.ID ? 'Shrani' : 'Ustvari'}
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

export default withRouter(Inventory);