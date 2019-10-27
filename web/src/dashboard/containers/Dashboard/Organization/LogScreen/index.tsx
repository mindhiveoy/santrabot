import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List } from '@material-ui/core';
import { ChatSessionWithId, Schema } from '@shared/schema';

import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { setActiveChatSession } from 'dashboard/reducers/chat-session/chatSessionActions';
import { NaviButtons, naviButtonStageChange, setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { ApplicationState } from 'dashboard/reducers';
import graphQlCall from 'utils/graphQlClient';
import { OrganizationRouteParams } from '..';
import ChatSessionContainer from './ChatSessionContainer';
import ChatSessionItem from './ChatSessionItem';

const FETCH_LIMIT = 40;

const StyledInfiniteScroll = styled(InfiniteScroll)`
  max-width: 330px;
  overflow-y: scroll;
  height: 100%;
`;

const DELETE_CHAT_SESSION_MUTATION = `
  mutation DeleteChatSession($organizationId: String!, $sessionId: String!) {
    deleteChatSession(organizationId: $organizationId, sessionId: $sessionId) {
      succeed
    }
  }
`;

export interface LogPanelProps extends RouteComponentProps<OrganizationRouteParams>, DispatchProp<any> {
  activeSession: string;
  drawerItems: DrawerItem[];
}

interface State {
  sessions: ChatSessionWithId[];
  hasMore: boolean;
  deleteSingleLogDialogOpen: boolean;
  deleteAllLogsDialogOpen: boolean;
}

class LogScreen extends React.Component<LogPanelProps, State> {
  public state: State = {
    sessions: [],
    hasMore: true,
    deleteSingleLogDialogOpen: false,
    deleteAllLogsDialogOpen: false,
  };

  private sessionsRef: firebase.firestore.CollectionReference;

  private query: firebase.firestore.Query;

  public componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.sessionsRef = firebaseApp
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .doc(params.organizationId)
      .collection(Schema.CHAT_SESSIONS);

    this.query = this.sessionsRef.orderBy('started').limit(FETCH_LIMIT);
    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  public componentDidUpdate(newProps: LogPanelProps) {
    if (newProps.activeSession !== this.props.activeSession) {
      this.props.dispatch(naviButtonStageChange());
    }
  }

  public getNaviButtons = (): NaviButtons => {
    const {
      match: { params },
    } = this.props;
    const { activeSession } = this.props;
    return {
      leftButtons: [
        <Button key="delete" variant="contained" color="primary" onClick={this.handleDeleteLogClick}>
          Poista
        </Button>,
        <Button
          key="csv"
          style={{ marginLeft: '10px' }}
          variant="contained"
          color="primary"
          disabled={!activeSession}
          target="_blank"
          href={`/csv/${params.organizationId}/${activeSession}.csv`}
        >
          CSV
        </Button>,
      ],
    };
  }

  public render() {
    const { activeSession, drawerItems, location } = this.props;
    const { sessions, hasMore } = this.state;

    return (
      <MainScreen noPadding drawerItems={drawerItems} location={location}>
        <StyledInfiniteScroll
          style={{ borderRight: '1px solid #3232' }}
          pageStart={0}
          loadMore={this.loadLogs}
          hasMore={hasMore}
          loader={
            <div className="loader" key={0}>
              Ladataan...
            </div>
          }
        >
          {(sessions.length === 0 && <span>Ei keskustelulogeja</span>) || (
            <List>
              {sessions.map((item, index) => (
                <ChatSessionItem
                  key={item.id}
                  data={item}
                  selected={activeSession === item.id}
                  onClick={this.handleChatSessionItemClick}
                />
              ))}
            </List>
          )}
        </StyledInfiniteScroll>
        <ChatSessionContainer />
        <Dialog
          open={this.state.deleteSingleLogDialogOpen}
          onClose={this.handleDeleteDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Poista chat-keskustelu?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Haluatko varmasti poistaa keskustelun? Toimintoa ei voi peruuttaa.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteDialogClose} color="secondary">
              Peruuta
            </Button>
            <Button onClick={this.handleDeleteClick} color="primary" autoFocus>
              Poista
            </Button>
          </DialogActions>
        </Dialog>
      </MainScreen>
    );
  }

  private handleDeleteDialogClose = () => {
    this.setState({
      deleteSingleLogDialogOpen: false,
    });
  }

  private handleDeleteClick = async () => {
    const {
      match: { params },
    } = this.props;

    this.handleDeleteDialogClose();

    try {
      await graphQlCall(DELETE_CHAT_SESSION_MUTATION, {
        organizationId: params.organizationId,
        sessionId: this.props.activeSession,
      });

      const sessions = this.state.sessions.slice();
      let index = sessions.findIndex(item => item.id === this.props.activeSession);
      if (index >= 0) {
        sessions.splice(index, 1);
      }
      if (index > sessions.length) {
        index = sessions.length - 1;
      }
      const activeSession = index >= 0 ? sessions[index].id : undefined;

      this.setState({
        sessions,
      });

      this.props.dispatch(setActiveChatSession(activeSession));
    } catch (error) {
      alert(error);
    }
  }

  private loadLogs = async () => {
    if (!this.query) {
      return;
    }

    try {
      const snapshot = await this.query.get();
      const sessions: ChatSessionWithId[] = this.state.sessions;

      snapshot.docs.forEach(doc => {
        const session = { id: doc.id, ...doc.data() } as ChatSessionWithId;
        sessions.push(session);
      });

      if (snapshot.docs.length > 0) {
        const last = snapshot.docs[snapshot.docs.length - 1];

        this.query = this.sessionsRef
          .orderBy('started')
          .startAfter(last.data().started)
          .limit(FETCH_LIMIT);

        sessions.sort((a, b) => (b.started as number) - (a.started as number));

        this.setState({
          sessions,
          hasMore: snapshot.docs.length === FETCH_LIMIT,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private handleChatSessionItemClick = (chatSessionId: string) => {
    this.props.dispatch && this.props.dispatch(setActiveChatSession(chatSessionId));
  }

  private handleDeleteLogClick = () => {
    this.setState({
      deleteSingleLogDialogOpen: true,
    });
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    activeSession: state.chat.activeSession,
    drawerItems: state.navi.drawerItems,
  };
};

export default withRouter(connect(mapStateToProps)(LogScreen));
