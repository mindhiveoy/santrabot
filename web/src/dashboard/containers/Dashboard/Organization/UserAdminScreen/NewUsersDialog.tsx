import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  NativeSelect,
  WithStyles,
  DialogActions,
  Grid,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { UserRole, USERROLE_ADMIN, USERROLE_CLOSED, USERROLE_USER } from '@shared/schema';
import FieldElement from 'dashboard/components/FieldElement';
import ChipInput from 'material-ui-chip-input';
import * as React from 'react';
import styled from 'styled-components';
import { Form, FormValidationRules, initForm, MessageType, validateForm } from 'ts-form-validation';
import * as validator from 'validator';

const StyledInputLabel = styled<any>(InputLabel)<any>`
  margin-bottom: 16px;
`;

const StyledFormControl = styled<any>(FormControl)<any>`
  width: 100%;
`;

const StyledChipInput = styled<any>(ChipInput)<any>`
  width: 100%;
`;

export interface UserForm {
  newUsers: string[];
  userRole: UserRole;
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
    userRole: {
      required: true,
    },
  },
};

export interface NewUsersDialogProps extends Partial<WithStyles> {
  open: boolean;
  onCancel: () => void;
  onSave: (newUsers: UserForm) => void;
}

export default class NewUsersDialog extends React.Component<NewUsersDialogProps, UserAdminState> {
  public state: UserAdminState = {
    modified: false,
    form: initForm<UserForm>(
      {
        newUsers: [],
        userRole: UserRole.USER,
      },
      rules,
    ),
  };

  public render() {
    const { open } = this.props;

    const {
      form: {
        values: { newUsers = [], userRole },
        messages,
        isFormValid,
      },
    } = this.state;

    return (
      <Dialog open={open} maxWidth="sm" fullWidth={true} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Lisää käyttäjiä</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
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
                    placeholder="Uudet käyttäjät"
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
            <Grid item xs={12}>
              <StyledFormControl>
                <StyledInputLabel htmlFor="userRole-native-helper">Käyttäjärooli</StyledInputLabel>
                <NativeSelect
                  value={userRole}
                  onChange={this.handleChange('userRole')}
                  input={<Input name="userRole" id="userRole-native-helper" />}
                >
                  <option value={USERROLE_CLOSED}>Suljettu</option>
                  <option value={USERROLE_USER}>Peruskäyttäjä</option>
                  <option value={USERROLE_ADMIN}>Pääkäyttäjä</option>
                </NativeSelect>
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

  private handleCancel = () => {
    this.props.onCancel();
    this.reset();
  };

  private handleSaveClick = () => {
    if (this.state.form.isFormValid) {
      this.props.onSave(this.state.form.values);
    }
    this.reset();
  };

  private handleUpdateInput = (event: React.ChangeEvent<any>) => {
    const values = {
      ...this.state.form.values,
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
    });
  };

  private reset = () => {
    this.setState({
      modified: false,
      form: initForm<UserForm>(
        {
          newUsers: [],
          userRole: UserRole.USER,
        },
        rules,
      ),
    });
  };

  private handleChange = (key: keyof UserForm) => (event: React.ChangeEvent<any>) => {
    this.changeFormField(key, event.target.value);
  };

  private handleBlur = (key: keyof UserForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
