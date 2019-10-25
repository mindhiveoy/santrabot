import { Button, Divider, Snackbar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import { Organization, OrganizationId, Schema } from '@shared/schema';
import CustomDialog from 'dashboard/components/CustomDialog/CustomDialog';
import { ButtonWrapper, CustomCircularProgress } from 'dashboard/containers/Dashboard/Organization/UserAdminScreen';
import { NaviButtons, setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import NewOrganizationDialog from './NewOrganizationDialog';
import OrganizationEditor from './organization-editor';

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  .organization-list {
    width: 250px;
  }
`;

interface State {
  organizations: Organization[];
  selectedOrganization?: Organization;
  modifiedOrganization?: Organization;
  newOrganizationDialogOpen: boolean;
  modified: boolean;
  saving: boolean;
  deleting: boolean;
  confirmDialogOpen: boolean;
  snackbarData: {
    open: boolean;
    msg?: string;
  };
}

class OrganizationAdminScreen extends React.Component<any, State> {
  private unsubscribe: () => void;

  constructor(props: any) {
    super(props);

    this.state = {
      organizations: [],
      selectedOrganization: undefined,
      newOrganizationDialogOpen: false,
      modified: false,
      saving: false,
      deleting: false,
      confirmDialogOpen: false,
      snackbarData: {
        open: false,
      },
    };
  }

  public componentDidMount() {
    this.unsubscribe = firebaseApp
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .onSnapshot(this.onOrganizationsSnapshot, (error: Error) => {
        console.error(error);
      });

    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  public componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  public render() {
    const {
      selectedOrganization,
      organizations,
      newOrganizationDialogOpen,
      confirmDialogOpen,
      modifiedOrganization,
      snackbarData,
    } = this.state;

    return (
      <Container>
        <List className="organization-list">
          {organizations.length > 0 ? (
            organizations.map(organization => (
              <>
                <ListItem
                  key={organization.id}
                  onClick={this.handleItemClick(organization.id)}
                  style={{
                    backgroundColor:
                      selectedOrganization && organization.id === selectedOrganization.id ? 'lightgray' : 'transparent',
                  }}
                >
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <ListItemText primary={organization.name} />
                </ListItem>
                <Divider />
              </>
            ))
          ) : (
            <ListItem disabled>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Ei organisaatioita" secondary="Aloita luomalla uusi organisaatio" />
            </ListItem>
          )}
        </List>
        {selectedOrganization && (
          <OrganizationEditor
            organization={modifiedOrganization ? modifiedOrganization : selectedOrganization}
            onChange={this.organizationEditorOnChangeHandler}
          />
        )}
        <NewOrganizationDialog
          open={newOrganizationDialogOpen}
          onCancel={this.closeNewOrganizationDialog}
          onSave={this.saveNewOrganization}
        />
        <CustomDialog
          open={confirmDialogOpen}
          title="Organisaation poistaminen"
          description={`Oletko varma, että haluat poistaa organisaation: ${selectedOrganization &&
            selectedOrganization.name}?`}
          okLabel="Poista"
          cancelLabel="Peruuta"
          onClose={this.confirmDialogOnCloseHandler}
          onOk={this.removeSelectedOrganization}
        />
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={snackbarData.open}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          message={snackbarData.msg}
        />
      </Container>
    );
  }

  private handleSnackbarClose = () => {
    this.setState({
      snackbarData: { open: false },
    });
  };

  private organizationEditorOnChangeHandler = (organization: Organization) => {
    this.setState({ modifiedOrganization: organization, modified: true }, () =>
      this.props.dispatch(setNaviButtons(this.getNaviButtons())),
    );
  };

  private removeSelectedOrganization = async () => {
    this.setState({ confirmDialogOpen: false, deleting: true });

    const { selectedOrganization } = this.state;
    if (selectedOrganization) {
      try {
        await firebaseApp
          .firestore()
          .collection(Schema.ORGANIZATIONS)
          .doc(selectedOrganization.id)
          .delete();
        this.setState({ deleting: false });
      } catch (error) {
        this.setState({ deleting: false });
        console.error(error);
      }
    }
  };

  private confirmDialogOnCloseHandler = () => {
    this.setState({ confirmDialogOpen: false });
  };

  private closeNewOrganizationDialog = () => {
    this.setState({ newOrganizationDialogOpen: false });
  };

  private saveNewOrganization = async (organization: Organization) => {
    this.setState({ newOrganizationDialogOpen: false, saving: true }, () =>
      this.props.dispatch(setNaviButtons(this.getNaviButtons())),
    );
    try {
      await firebaseApp
        .firestore()
        .collection(Schema.ORGANIZATIONS)
        .doc(organization.id)
        .set(organization, { merge: true });

      this.setState({ saving: false, snackbarData: { open: true, msg: 'Uusi organisaatio luotu!' } }, () =>
        this.props.dispatch(setNaviButtons(this.getNaviButtons())),
      );
    } catch (error) {
      this.setState({ saving: false });
      console.error(error);
    }
  };

  private handleOpenDialog = () => {
    this.setState({ newOrganizationDialogOpen: true });
  };

  private getNaviButtons = (): Partial<NaviButtons> => {
    const { saving, modified, deleting, selectedOrganization } = this.state;

    return {
      leftButtons: (
        <>
          <Button key="add" variant="contained" color="primary" onClick={this.handleOpenDialog}>
            Lisää
          </Button>
          <ButtonWrapper>
            <Button
              key="save"
              style={{ marginLeft: '10px' }}
              variant="contained"
              color="primary"
              disabled={saving ? saving : !modified}
              onClick={this.handleSaveClick}
            >
              Tallenna
            </Button>
            {saving && <CustomCircularProgress size={24} />}
          </ButtonWrapper>
          <ButtonWrapper>
            <Button
              key="delete"
              style={{ marginLeft: '10px' }}
              variant="contained"
              color="primary"
              disabled={!selectedOrganization}
              onClick={this.handleDeleteClick}
            >
              Poista
            </Button>
            {deleting && <CustomCircularProgress size={24} />}
          </ButtonWrapper>
        </>
      ),
    };
  };

  private handleSaveClick = async () => {
    const { modifiedOrganization } = this.state;
    this.setState({ newOrganizationDialogOpen: false, saving: true }, () =>
      this.props.dispatch(setNaviButtons(this.getNaviButtons())),
    );

    if (modifiedOrganization) {
      try {
        const { id } = modifiedOrganization;
        delete modifiedOrganization.id;

        await firebaseApp
          .firestore()
          .collection(Schema.ORGANIZATIONS)
          .doc(id)
          .update(modifiedOrganization);
        this.setState(
          {
            saving: false,
            modified: false,
            modifiedOrganization: undefined,
            snackbarData: { open: true, msg: 'Muutokset tallennettu!' },
          },
          () => this.props.dispatch(setNaviButtons(this.getNaviButtons())),
        );
      } catch (error) {
        this.setState({ saving: false });
      }
    }
  };

  private handleDeleteClick = () => {
    this.setState({ confirmDialogOpen: true });
  };

  private onOrganizationsSnapshot = (snapshot: firebase.firestore.QuerySnapshot) => {
    if (snapshot.empty) {
      this.setState({
        organizations: [],
      });
      return;
    }

    const { selectedOrganization } = this.state;
    let updatedSelectedOrganization;
    const organizations = snapshot.docs.map(doc => {
      const o = {
        ...doc.data(),
        id: doc.id,
      } as Organization;

      if (selectedOrganization && selectedOrganization.id === doc.id) {
        updatedSelectedOrganization = o;
      }
      return o;
    });

    this.setState({
      organizations,
      selectedOrganization: updatedSelectedOrganization,
    });
  };

  private handleItemClick = (id: OrganizationId) => () => {
    const data = this.state.organizations.find(item => item.id === id);
    if (data) {
      this.setState(
        {
          selectedOrganization: data,
        },
        () => this.props.dispatch(setNaviButtons(this.getNaviButtons())),
      );
    }
  };
}

export default connect()(OrganizationAdminScreen);
