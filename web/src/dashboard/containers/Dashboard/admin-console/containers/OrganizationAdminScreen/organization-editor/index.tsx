import { Grid } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { Organization } from '@shared/schema';
import FieldElement from 'dashboard/components/FieldElement';
import ChipInput from 'material-ui-chip-input';
import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex-grow: 1;
  padding: 32px;

  .header {
    margin-bottom: 25px;
  }
`;

export interface OrganizationEditorProps {
  organization: Organization;
  onChange: (organization: Organization) => void;
}

export default class OrganizationEditor extends React.Component<OrganizationEditorProps> {
  public render() {
    const { organization } = this.props;
    const { admins } = organization;
    const adminKeys = admins && Object.keys(admins);

    return (
      <Container>
        <Typography className="header" variant="h5" gutterBottom>
          Muokkaa organisaatiota
        </Typography>
        <FormControl>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FieldElement>
                <InputLabel htmlFor="name">Nimi</InputLabel>
                <Input id="name" fullWidth={true} value={organization.name} onChange={this.handleChange('name')} />
              </FieldElement>
            </Grid>
            <Grid item xs={12}>
              <FieldElement>
                <ChipInput
                  value={adminKeys || ['']}
                  blurBehavior="add"
                  fullWidth={true}
                  onAdd={this.handleAddUser}
                  onDelete={this.handleDeleteUser}
                  placeholder="Pääkäyttäjät"
                  defaultValue={[]}
                />
              </FieldElement>
            </Grid>
          </Grid>
        </FormControl>
      </Container>
    );
  }

  private handleAddUser = (email: string) => {
    this.props.onChange({
      ...this.props.organization,
      admins: {
        ...this.props.organization.admins,
        [email]: true,
      },
    });
  };

  private handleDeleteUser = (email: string, index: number) => {
    const {
      organization,
      organization: { admins },
    } = this.props;
    if (admins) {
      delete admins[email];

      this.props.onChange({
        ...organization,
        admins,
      });
    }
  };

  private handleChange = (name: keyof Organization) => (event: React.ChangeEvent<any>) => {
    this.props.onChange({
      ...this.props.organization,
      [name]: event.target.value,
    });
  };
}
