import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as React from 'react';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  fileName: string;
  onApprove(): void;
  onCancel(): void;
}

export default class ConfirmDeleteDialog extends React.Component<ConfirmDeleteDialogProps, any> {
  constructor(props: ConfirmDeleteDialogProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { open, fileName } = this.props;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={open}
      >
        <DialogTitle id="confirmation-dialog-title">Poista tiedosto: {fileName}</DialogTitle>
        <DialogContent>Toimintoa ei voida perua.</DialogContent>{' '}
        <DialogActions>
          <Button variant="contained" onClick={this.handleCancel} color="secondary">
            Peruuta
          </Button>
          <Button variant="contained" onClick={this.handleOk} color="primary">
            Poista
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private handleCancel = () => {
    this.props.onCancel();
  }

  private handleOk = () => {
    this.props.onApprove();
  }
}
