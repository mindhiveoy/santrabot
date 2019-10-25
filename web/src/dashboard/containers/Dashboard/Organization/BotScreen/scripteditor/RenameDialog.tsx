import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as React from 'react';

export interface RenameDialogProps {
  open: boolean;
  fileName: string;
  onValidate(name: string): boolean;
  onApprove(fileName: string): void;
  onCancel(): void;
}
interface State {
  valid: boolean;
  fileName: string;
}

export default class RenameDialog extends React.Component<RenameDialogProps, State> {
  constructor(props: RenameDialogProps) {
    super(props);
    this.state = {
      valid: false,
      fileName: props.fileName,
    };
  }

  public componentDidUpdate(priorProps: RenameDialogProps) {
    if (this.props.fileName !== priorProps.fileName) {
      this.setState({
        fileName: this.props.fileName,
      });
    }
  }

  public handleCancel = () => {
    this.props.onCancel();
  }

  public handleOk = () => {
    this.state.valid && this.props.onApprove(this.state.fileName.trim());
  }

  public handleChange = (event: React.ChangeEvent<any>) => {
    const fileName = event.target.value;

    const valid = this.isValid(fileName);
    this.setState({
      fileName,
      valid,
    });
  }

  public render() {
    const { open } = this.props;

    const { fileName, valid } = this.state;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="md"
        aria-labelledby="confirmation-dialog-title"
        open={open}
        style={{ minWidth: 400 }}
      >
        <DialogTitle id="confirmation-dialog-title">Nimeä uudelleen: {this.props.fileName}</DialogTitle>
        <DialogContent>
          <TextField
            onFocus={this.handleTextFieldFocus}
            autoFocus
            fullWidth
            value={fileName}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyPress}
          />
        </DialogContent>{' '}
        <DialogActions>
          <Button variant="contained" onClick={this.handleCancel} color="secondary">
            Peruuta
          </Button>
          <Button disabled={!valid} variant="contained" onClick={this.handleOk} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private handleTextFieldFocus = (event: any) => {
    event.preventDefault();
    const { target } = event;
    target.select();
  }

  private isValid = (fileName: string): boolean => {
    if (
      !fileName ||
      fileName.trim().length === 0 ||
      fileName.trim().length > 20 ||
      fileName.trim() === this.props.fileName
    ) {
      return false;
    }
    return this.props.onValidate(fileName);
  }

  private handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.handleOk();
    }
  }
}
