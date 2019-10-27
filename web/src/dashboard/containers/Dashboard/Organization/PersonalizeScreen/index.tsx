import { Button, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import { ChatBubbleTheme, ChatConfiguration, DEFAULT_BOT_NAME, Schema } from '@shared/schema';
import ChatContainer, { ChatSessionState, defaultChatConfiguration } from 'chat';
import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { ApplicationState } from 'dashboard/reducers';
import { UserOrganizatioInfoWithId } from 'dashboard/reducers/auth/authReducer';
import { setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import deepmerge from 'deepmerge';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import styled from 'styled-components';

import firebaseApp from 'firebaseApp';
import { RouteComponentProps, withRouter } from 'react-router';
import { OrganizationRouteParams } from '..';
import ColorPicker from './components/ColorPicker';
import PersonalizationChatMessageHandler from './PersonalizationChatMessageHandler';

const FormContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;
`;

const ChatPreviewContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  justify-content: space-between;
  background-color: lightblue;
  margin-right: 16px;
`;

const FormField = styled.div`
  display: block;
  /* padding-left: 16px; */
`;

const Caption = styled.h3``;

const StyledTextField = styled<any>(TextField)`
  padding-left: 16px;
`;

const StyledSlider = styled<any>(Slider)`
  padding-top: 8px;
  padding-bottom: 8px;
`;

export interface PersonalizeProps extends DispatchProp, RouteComponentProps<OrganizationRouteParams> {
  activeOrganization?: UserOrganizatioInfoWithId;
  configuration?: ChatConfiguration;
  drawerItems: DrawerItem[];
}

interface State {
  modified: boolean;
  configuration: ChatConfiguration;
}

class PersonalizeScreen extends React.Component<PersonalizeProps, State> {
  private readyMessageHandler: PersonalizationChatMessageHandler = new PersonalizationChatMessageHandler(
    ChatSessionState.READY,
  );

  private botRef: firebase.firestore.DocumentReference;

  private activeMessageHandler: PersonalizationChatMessageHandler = new PersonalizationChatMessageHandler(
    ChatSessionState.ACTIVE,
  );

  constructor(props: PersonalizeProps) {
    super(props);

    this.state = {
      modified: false,
      configuration: this.props.configuration ? this.props.configuration : defaultChatConfiguration,
    };
  }

  public componentDidMount() {
    const {
      match: { params },
    } = this.props;

    if (params.organizationId) {
      this.botRef = firebaseApp
        .firestore()
        .collection(Schema.ORGANIZATIONS)
        .doc(params.organizationId)
        .collection(Schema.BOTS)
        .doc(DEFAULT_BOT_NAME);

      this.botRef
        .get()
        .then(snapshot => {
          if (snapshot.exists) {
            const snapdata = snapshot.data() || {};
            const configuration = deepmerge(defaultChatConfiguration, snapdata.configuration) as ChatConfiguration;
            this.setState({
              configuration,
              modified: false,
            });
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  public render() {
    const { configuration } = this.state;
    const { drawerItems } = this.props;

    return (
      <MainScreen drawerItems={drawerItems}>
        {this.renderFirstColumn()}
        {this.renderSecondColumn()}

        <ChatPreviewContainer>
          <Caption>Valmis</Caption>
          <ChatContainer configuration={configuration} designMode={true} messageHandler={this.readyMessageHandler} />
        </ChatPreviewContainer>

        <ChatPreviewContainer>
          <Caption>Aktiivinen</Caption>
          <ChatContainer
            configuration={configuration}
            designMode={true}
            messageHandler={this.activeMessageHandler}
            initialMessages={[
              {
                id: '1',
                user: 'user1',
                date: new Date().getTime(),
                content: 'Miltä Santra näyttää?',
              },
              {
                id: '2',
                user: 'bot',
                date: new Date().getTime(),
                content: 'Äärimmäisen hyvältä!',
              },
            ]}
          />
        </ChatPreviewContainer>
      </MainScreen>
    );
  }

  private getNaviButtons(): any {
    return {
      leftButtons: [
        <Button
          key="save"
          disabled={!this.state.modified}
          variant="contained"
          color="primary"
          onClick={this.handleSaveClick}
        >
          Tallenna
        </Button>,
      ],
    };
  }

  private renderFirstColumn = () => {
    const { configuration } = this.state;
    return (
      <FormContainer>
        <FormField>
          <Typography id="chatInputPlaceHolder">Chattilaatikon vihjeteksti</Typography>
          <StyledTextField
            id="chatInputPlaceHolder"
            multiline={true}
            value={configuration.chatInputPlaceHolder}
            onChange={this.handleChange('chatInputPlaceHolder')}
            margin="normal"
          />
        </FormField>
        <FormField>
          <Typography id="chatGuideText">Valmis-tilan ohjeteksti</Typography>
          <StyledTextField
            id="chatGuideText"
            multiline={true}
            // className={classes.textField}
            value={configuration.chatGuideText}
            onChange={this.handleChange('chatGuideText')}
            margin="normal"
          />
        </FormField>

        <FormField>
          <Typography id="headerText">Chat-ikkunan otsikkoteksti</Typography>
          <StyledTextField
            id="headerText"
            multiline={true}
            value={configuration.headerText}
            onChange={this.handleChange('headerText')}
            margin="normal"
          />
        </FormField>
      </FormContainer>
    );
  }

  private renderSecondColumn = () => {
    const { configuration } = this.state;
    return (
      <FormContainer>
        <FormField>
          <ColorPicker
            color={configuration.headerColor}
            title="Otsikkoteksti"
            onPickColor={this.handleModelChange('headerColor')}
          />
          <ColorPicker
            color={configuration.headerBackground}
            title="Otsikkotausta"
            onPickColor={this.handleModelChange('headerBackground')}
          />

          <ColorPicker
            color={configuration.background}
            title="Taustaväri"
            onPickColor={this.handleModelChange('background')}
          />
          <ColorPicker color={configuration.color} title="Fonttiväri" onPickColor={this.handleModelChange('color')} />
          <ColorPicker
            color={configuration.user.color}
            title="Käyttäjä kuplateksti"
            onPickColor={this.handleModelBubbleChange('user', 'color')}
          />
          <ColorPicker
            color={configuration.user.background}
            title="Käyttäjä kuplatausta"
            onPickColor={this.handleModelBubbleChange('user', 'background')}
          />
          <ColorPicker
            color={configuration.user.dateColor}
            title="Käyttäjä päivämääräväri"
            onPickColor={this.handleModelBubbleChange('user', 'dateColor')}
          />
          <ColorPicker
            color={configuration.bot.color}
            title="Botti kuplateksti"
            onPickColor={this.handleModelBubbleChange('bot', 'color')}
          />
          <ColorPicker
            color={configuration.bot.background}
            title="Botti kuplatausta"
            onPickColor={this.handleModelBubbleChange('bot', 'background')}
          />
          <ColorPicker
            color={configuration.bot.dateColor}
            title="Botti päivämääräväri"
            onPickColor={this.handleModelBubbleChange('bot', 'dateColor')}
          />

          <FormField>
            <Typography id="userMargin">Käyttäjä marginaali</Typography>
            <StyledSlider
              value={configuration.user.margin}
              aria-labelledby="userMargin"
              onChange={this.handleModelBubbleChangeEvent('user', 'margin')}
              min={0}
              max={50}
            />
          </FormField>
          <FormField>
            <Typography id="userMargin">Otsikkon sisennys</Typography>
            <StyledSlider
              value={configuration.headerPadding}
              aria-labelledby="userMargin"
              onChange={this.handleChange('headerPadding')}
              min={0}
              max={50}
            />
          </FormField>
          <FormField>
            <Typography id="userMargin">Käyttäjä sisennys</Typography>
            <StyledSlider
              value={configuration.user.padding}
              aria-labelledby="userMargin"
              onChange={this.handleModelBubbleChangeEvent('user', 'padding')}
              min={0}
              max={50}
            />
          </FormField>

          <FormField>
            <Typography id="botMargin">Botti marginaali</Typography>
            <StyledSlider
              value={configuration.bot.margin}
              aria-labelledby="botMargin"
              onChange={this.handleModelBubbleChangeEvent('bot', 'margin')}
              min={0}
              max={50}
            />
          </FormField>
          <FormField>
            <Typography id="userMargin">Botti sisennys</Typography>
            <StyledSlider
              value={configuration.bot.padding}
              aria-labelledby="userMargin"
              onChange={this.handleModelBubbleChangeEvent('bot', 'padding')}
              min={0}
              max={50}
            />
          </FormField>
        </FormField>

        <FormField>
          <Typography id="chatWindowRadius">Ikkunan pyöristys</Typography>
          <StyledSlider
            value={configuration.borderRadius}
            aria-labelledby="chatWindowRadius"
            onChange={this.handleChange('borderRadius')}
            min={0}
            max={50}
          />
        </FormField>
        <FormField>
          <Typography id="chatWindowMargin">Chatin marginaali</Typography>
          <StyledSlider
            value={configuration.margin}
            aria-labelledby="chatWindowMargin"
            onChange={this.handleChange('margin')}
            min={0}
            max={50}
          />
        </FormField>
        <FormField>
          <Typography id="chatBubleRadius">Chat-kuplan pyöritys</Typography>
          <StyledSlider
            value={configuration.bubbleBorderRadius}
            aria-labelledby="chatBubleRadius"
            onChange={this.handleChange('bubbleBorderRadius')}
            min={0}
            max={50}
          />
        </FormField>
        <FormField>
          <Typography id="chatWindowWidth">Chat-ikkunan leveys</Typography>
          <StyledSlider
            value={configuration.chatWindowWidth}
            aria-labelledby="chatWindowWidth"
            onChange={this.handleChange('chatWindowWidth')}
            min={300}
            max={1000}
          />
        </FormField>
      </FormContainer>
    );
  }

  private handleSaveClick = async () => {
    try {
      await this.botRef.update({
        configuration: this.state.configuration,
      });
      this.setState({
        modified: false,
      });
      this.props.dispatch(setNaviButtons(this.getNaviButtons()));
    } catch (error) {
      console.error(error);
    }
  }

  private handleModelBubbleChangeEvent = (buble: 'user' | 'bot', key: keyof ChatBubbleTheme) => (
    event: React.ChangeEvent<any>,
    value: any,
  ) => {
    const configuration = { ...this.state.configuration } as ChatConfiguration;

    const bubleObject = configuration[buble] as any;
    bubleObject[key] = value ? value : event.target.value;

    this.setState({
      configuration,
      modified: true,
    });

    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  private handleModelChange = (key: keyof ChatConfiguration) => (value: any) => {
    const configuration = {
      ...this.state.configuration,
      [key]: value,
    };

    this.setState({
      configuration,
      modified: true,
    });

    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  private handleModelBubbleChange = (buble: 'user' | 'bot', key: keyof ChatBubbleTheme) => (value: any) => {
    const configuration = { ...this.state.configuration } as ChatConfiguration;

    const bubleObject = configuration[buble] as any;
    bubleObject[key] = value;

    this.setState({
      configuration,
      modified: true,
    });
    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }

  private handleChange = (key: keyof ChatConfiguration) => (event: React.ChangeEvent<any>, value?: any) => {
    const configuration = {
      ...this.state.configuration,
      [key]: value ? value : event.target.value,
    };

    this.setState({
      configuration,
      modified: true,
    });
    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    activeOrganization: state.auth.activeOrganization,
    drawerItems: state.navi.drawerItems,
  };
};

export default withRouter(connect(mapStateToProps)(PersonalizeScreen));
