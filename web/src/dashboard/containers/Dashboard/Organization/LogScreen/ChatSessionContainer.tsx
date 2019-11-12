import { ChatMessageResponse, Schema } from '@shared/schema';
import { ApplicationState } from 'dashboard/reducers';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { OrganizationRouteParams } from '..';
import ChatHistoryItem from './components/ChatHistoryItem';

export interface ChatSessionContainerProps
  extends RouteComponentProps<OrganizationRouteParams>,
    DispatchProp<any> {
  activeSession?: string;
}

export interface State {
  loading: boolean;
  messages: ChatMessageResponse[];
}

class ChatSessionContainer extends React.Component<
  ChatSessionContainerProps,
  State
> {
  constructor(props: ChatSessionContainerProps) {
    super(props);

    this.state = {
      loading: false,
      messages: [],
    };
  }

  public componentDidUpdate(prevProps: ChatSessionContainerProps) {
    const {
      match: { params },
    } = prevProps;

    /*
     * Fetch new chat session data if session has changed
     */
    if (prevProps.activeSession !== this.props.activeSession) {
      this.setState({
        loading: true,
      });

      const sessionsRef = firebaseApp
        .firestore()
        .collection(Schema.ORGANIZATIONS)
        .doc(params.organizationId)
        .collection(Schema.CHAT_SESSIONS)
        .doc(this.props.activeSession)
        .collection(Schema.CHAT_MESSAGES);

      sessionsRef
        .get()
        .then(snapshot => {
          const messages: ChatMessageResponse[] = [];

          snapshot.docs.forEach(doc => {
            messages.push(doc.data() as ChatMessageResponse);
          });

          messages.sort(
            (a, b) => a.user.date - b.user.date,
          );

          this.setState({
            messages,
            loading: false,
          });
        })
        .catch(error => console.error(error));
    }
  }

  public render() {
    const { loading, messages } = this.state;

    if (loading) {
      // TODO loader animation
      return (
        <div style={{ margin: '30px' }}>
          <h2>Ladataan...</h2>
        </div>
      );
    }
    return (
      <div>
        {(messages.length > 0 &&
          messages.map((item, index) => {
            return <ChatHistoryItem key={index} item={item} />;
          })) || (
          <div style={{ margin: '30px' }}>
            <h2>Ei viestejä</h2>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    activeSession: state.chat.activeSession,
  };
};

export default connect(mapStateToProps)(withRouter(ChatSessionContainer));
