import { FormGroup, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { ApplicationState } from 'dashboard/reducers';
import { setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { embedScript } from './embedCode';

export interface EmbedScreenProps extends RouteComponentProps<any>, DispatchProp<any> {
  drawerItems: DrawerItem[];
}

const StyledForm = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledFormGroup = styled<any>(FormGroup)`
  display: block;
  padding: 16px;
`;

class EmbedScreen extends React.Component<EmbedScreenProps, any> {
  public componentDidMount() {
    this.props.dispatch(setNaviButtons({ leftButtons: undefined }));
  }

  public render() {
    const uri = `https://${CONFIG.firebase.authDomain}/js/chat-client.min.js`;
    const organizationId = this.props.match.params.organizationId;

    const code = embedScript(organizationId, uri);
    const { drawerItems } = this.props;

    return (
      <MainScreen drawerItems={drawerItems} noPadding location={location}>
        <StyledForm>
          <StyledFormGroup>
            <Typography variant="caption">
              Lisää Santrabotti sivuillesi upottamalla alla oleva scripti osaksi sivustosi html-koodia:
            </Typography>{' '}
          </StyledFormGroup>
          <StyledFormGroup>
            <textarea cols={80} rows={20} readOnly id="embedCode" value={code} />
          </StyledFormGroup>
          <StyledFormGroup>
            <Button variant="contained" id="copyButton" onClick={this.handleCopyClick}>
              Kopioi leikepöydälle
            </Button>
          </StyledFormGroup>
        </StyledForm>
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </MainScreen>
    );
  }

  private handleCopyClick = () => {
    const copyText: any = document.getElementById('embedCode');
    copyText.select();
    document.execCommand('copy');
  };
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => {
  return {
    ...ownProps,
    drawerItems: state.navi.drawerItems,
  };
};

export default connect(mapStateToProps)(withRouter(EmbedScreen));
