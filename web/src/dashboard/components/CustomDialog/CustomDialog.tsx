import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import * as React from 'react';

interface CustomDialogProps {
  title: string;
  description?: string;
  cancelLabel: string;
  okLabel: string;
  onClose: () => void;
  onOk: () => void;
  open: boolean;
}

export default class CustomDialog extends React.Component<CustomDialogProps> {
  public render() {
    const { cancelLabel, okLabel, onClose, onOk, open, description, title } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          {description && <DialogContentText id="alert-dialog-description">{description}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {cancelLabel}
          </Button>
          <Button onClick={onOk} color="primary" autoFocus>
            {okLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
