import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

// Simple dialog used to simplify actions which require additional user confirmation.
export default ({onCancel, onConfirm, title, text, open}) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle key='confirm-dialog-title'>{title}</DialogTitle>
    <DialogContent key='confirm-dialog-content'>
      <DialogContentText>{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button key='cancel-button' onClick={onCancel} color='primary'>
        Prekliči
      </Button>
      <Button
        key='confirm-button'
        onClick={onConfirm}
        color='primary'
        autoFocus>
        Da
      </Button>
    </DialogActions>
  </Dialog>
);
