import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  WithStyles,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Organization } from '@shared/schema';
import FieldElement from 'dashboard/components/FieldElement';
import ChipInput from 'material-ui-chip-input';
import * as React from 'react';
import styled from 'styled-components';
import { Form, FormValidationRules, initForm, MessageType, validateForm } from 'ts-form-validation';
import * as validator from 'validator';

const StyledFormControl = styled<any>(FormControl)<any>`
  width: 100%;
`;

const StyledChipInput = styled<any>(ChipInput)<any>`
  width: 100%;
`;

export interface UserForm {
  newUsers: string[];
  name: string;
}

export interface UserAdminState {
  modified: boolean;
  form: Form<UserForm>;
}

const rules: FormValidationRules<UserForm> = {
  fields: {
    newUsers: {
      required: true,
      validate: value => {
        if (value && Array.isArray(value) && value.length > 0) {
          for (const email of value) {
            if (!validator.isEmail(email)) {
              return {
                type: MessageType.ERROR,
                message: `${email} ei ole kelvollinen sähköpostiosoite`,
              };
            }
          }
          return true;
        }
        return {
          type: MessageType.ERROR,
          message: 'Syötä vähintään yksi uusi sähköpostiosoite',
        };
      },
    },
    name: {
      required: true,
    },
  },
};

export interface NewOrganizationDialogProps extends Partial<WithStyles> {
  open: boolean;
  onCancel: () => void;
  onSave: (organization: Organization) => void;
}

export default class NewOrganizationDialog extends React.Component<NewOrganizationDialogProps, UserAdminState> {
  public state: UserAdminState = {
    modified: false,
    form: initForm<UserForm>(
      {
        newUsers: [],
        name: '',
      },
      rules,
    ),
  };

  public render() {
    const { open } = this.props;

    const {
      form: {
        values: { newUsers = [], name = '' },
        messages,
        isFormValid,
      },
    } = this.state;

    return (
      <Dialog open={open} maxWidth="sm" fullWidth={true} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Lisää Organisaatio</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledFormControl>
                <TextField
                  label="Nimi"
                  autoFocus
                  value={name}
                  InputLabelProps={{ shrink: true }}
                  onChange={this.onChangeHandler}
                  onBlur={this.handleBlur('name')}
                />
                {messages.name && (
                  <FormHelperText error={messages.name.type === MessageType.ERROR}>
                    {messages.name.message}
                  </FormHelperText>
                )}
              </StyledFormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledFormControl>
                <FieldElement>
                  <StyledChipInput
                    value={newUsers}
                    blurBehavior="add"
                    onAdd={this.handleAddUser}
                    onDelete={this.handleDeleteUser}
                    onUpdateInput={this.handleUpdateInput}
                    defaultValue={[]}
                    placeholder="Pääkäyttäjät"
                    onBlur={this.handleBlur('newUsers')}
                  />

                  {messages.newUsers && (
                    <FormHelperText error={messages.newUsers.type === MessageType.ERROR}>
                      {messages.newUsers.message}
                    </FormHelperText>
                  )}
                </FieldElement>
              </StyledFormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel}>Peruuta</Button>
          <Button disabled={!isFormValid} variant="contained" onClick={this.handleSaveClick}>
            Lisää
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      form: validateForm(this.state.form, {
        usePreprocessor: false,
        setValues: {
          ...this.state.form.values,
          name: e.target.value,
        },
      }),
      modified: true,
    });
  };

  private handleCancel = () => {
    this.props.onCancel();
    this.reset();
  };

  private handleSaveClick = () => {
    if (this.state.form.isFormValid) {
      const {
        form: { values },
      } = this.state;

      if (values) {
        const admins = {};
        values.newUsers.forEach(item => {
          admins[item] = true;
        });

        const newOrganization: Organization = {
          id: values.name,
          name: values.name,
          admins,
        };
        this.props.onSave(newOrganization);
      }
    }
    this.reset();
  };

  private handleUpdateInput = () => {
    const values = {
      ...this.state.form.values,
    };

    const form = validateForm(
      {
        ...this.state.form,
        values,
      },
      {
        usePreprocessor: false,
      },
    );

    this.setState({
      form,
    });
  };

  private reset = () => {
    this.setState({
      modified: false,
      form: initForm<UserForm>(
        {
          newUsers: [],
          name: '',
        },
        rules,
      ),
    });
  };

  private handleBlur = (key: keyof UserForm) => () => {
    // set field filled after blur, means that the field as been set once
    let form = { ...this.state.form };
    const filled = {
      ...form.filled,
      [key]: true,
    };

    form = validateForm({
      ...this.state.form,
      filled,
    });

    this.setState({
      form,
    });
  };

  private changeFormField = (key: keyof UserForm, value: any) => {
    const values = {
      ...this.state.form.values,
      [key]: value,
    };

    const form = validateForm(
      {
        ...this.state.form,
        values,
      },
      {
        // Disable preprocess while validating when writing
        usePreprocessor: false,
      },
    );

    this.setState({
      form,
      modified: true,
    });
  };

  private handleAddUser = (email: string) => {
    const newUsers = this.state.form.values.newUsers.slice();
    newUsers.push(email);
    this.changeFormField('newUsers', newUsers);
  };

  private handleDeleteUser = (email: string, index: number) => {
    const newUsers = this.state.form.values.newUsers.slice();
    newUsers.splice(index, 1);
    this.changeFormField('newUsers', newUsers);
  };
}
