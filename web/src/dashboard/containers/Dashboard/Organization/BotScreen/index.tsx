import { Organization, Script } from '@shared/schema';
import ChatContainer, { ChatSessionHandler } from 'chat';
import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { ApplicationState } from 'dashboard/reducers';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';

import Button from '@material-ui/core/Button';
import { EMPTY_SCRIPT_FILE, RIVE_START_DOCUMENT } from '@shared/bot/intepreter';
import { NaviButtons, setNaviButtons } from 'dashboard/reducers/navi/naviActions';

import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import DashboardChatMessageHandler from './DashboardChatMessageHandler';
import CodeEditor from './scripteditor';

const ContentPane = styled.div`
  width: 100%;
  height: 100%;
`;

export interface BotPanelProps extends DispatchProp<any>, RouteComponentProps<any> {
  activeOrganization?: Organization;
  drawerItems: DrawerItem[];
}

interface State {
  scripts: Script[];
  modified?: Script;
  code: string;
  activeScriptName: string;
  deleteDialogOpen: boolean;
  renameDialogOpen: boolean;
  checked: object;
}

class BotScreen extends React.PureComponent<BotPanelProps, State> {
  public state: State = {
    scripts: [],
    code: '',
    activeScriptName: '',
    deleteDialogOpen: false,
    renameDialogOpen: false,
    checked: {},
  };

  private messageHandler: ChatSessionHandler;
  // private scriptsRef: firebase.firestore.CollectionReference;
  constructor(props: BotPanelProps) {
    super(props);
    this.messageHandler = new DashboardChatMessageHandler(() =>
      props.activeOrganization ? props.activeOrganization.id : '-',
    );
  }

  public componentDidMount() {
    this.naviButtonStageChange(this.state);
  }

  public componentDidUpdate(newProps: BotPanelProps, newState: State) {
    if (this.state !== newState) {
      this.naviButtonStageChange(newState);
    }
  }

  public render() {
    const { drawerItems, location } = this.props;
    return (
      <MainScreen
        drawerItems={drawerItems}
        location={location}
        appBarRightButtons={this.listRightBarButtons()}
        noPadding
      >
        <ContentPane>
          <CodeEditor />
          <ChatContainer messageHandler={this.messageHandler} />
        </ContentPane>
      </MainScreen>
    );
  }

  private naviButtonStageChange = (state: State) => {
    this.props.dispatch(setNaviButtons(this.getNaviButtons(state)));
  }

  private listRightBarButtons = () => {
    const { modified = {}, activeScriptName } = this.state;

    const disabled = Object.keys(modified).length === 0;

    const isDefaultDocument = activeScriptName === RIVE_START_DOCUMENT;
    return [
      <Button key="save" disabled={disabled} variant="contained" color="primary" onClick={this.handleSaveClick}>
        Tallenna
      </Button>,
      <Button key="add-doc" variant="contained" color="primary" onClick={this.handleNewDocument}>
        Lisää dokumentti
      </Button>,
      <Button
        key="remove-doc"
        style={{ marginLeft: '10px' }}
        disabled={isDefaultDocument}
        variant="contained"
        color="primary"
        onClick={this.handleDeleteDocument}
      >
        Poista dokumentti
      </Button>,
      <Button
        key="rename-doc"
        style={{ marginLeft: '10px' }}
        disabled={isDefaultDocument}
        variant="contained"
        color="primary"
        onClick={this.handleRenameDocument}
      >
        Nimeä dokumentti
      </Button>,
    ];
  }

  private getNaviButtons = (state: State): Partial<NaviButtons> => {
    const { modified, checked } = state;

    let count = 0;
    Object.keys(checked).forEach(key => checked[key] && count++);

    return {
      leftButtons: (
        <>
          <Button key="add" onClick={this.handleNewDocument}>
            Lisää
          </Button>
          <Button key="save" style={{ marginLeft: '10px' }} disabled={!modified} onClick={this.handleSaveClick}>
            Tallenna
          </Button>
          <Button key="rename" style={{ marginLeft: '10px' }} disabled={!modified} onClick={this.handleRenameDocument}>
            Nimeä
          </Button>
          <Button
            key="delete"
            style={{ marginLeft: '10px' }}
            disabled={count === 0}
            onClick={this.handleDeleteDocument}
          >
            Poista
          </Button>
        </>
      ),
    };
  }

  private handleSaveClick = () => {
    alert('Save');
  }
  /**
   * Create a new script document into memory
   */
  private handleNewDocument = () => {
    const scripts = this.state.scripts ? [...this.state.scripts] : [];

    const activeScriptName = this.uniqueScriptName(scripts, 'tiedosto');
    const newScript = { ...EMPTY_SCRIPT_FILE };
    newScript.name = activeScriptName;
    newScript.modified = Date.now();

    scripts.push(newScript);

    const modified = { ...this.state.modified, [activeScriptName]: true };

    this.setState({
      activeScriptName,
      scripts,
      code: newScript.data,
      modified,
    } as any);
  }

  private handleRenameDocument = () => {
    this.setState({
      renameDialogOpen: true,
    });
  }

  private handleDeleteDocument = () => {
    this.setState({
      deleteDialogOpen: true,
    });
  }

  private uniqueScriptName = (scripts: Script[], name: string): string => {
    let index = 1;
    let fileName = name;
    while (scripts.find(item => item.name === fileName)) {
      fileName = name + index++;
    }
    return fileName;
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: Partial<BotPanelProps>) => {
  return {
    ...ownProps,
    drawerItems: state.navi.drawerItems,
    activeOrganization: state.auth.activeOrganization,
  };
};

export default withRouter(connect(mapStateToProps)(BotScreen));
