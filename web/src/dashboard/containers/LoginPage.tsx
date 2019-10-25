import * as React from 'react';

import Button from '@material-ui/core/Button';
import BuildInfo from 'dashboard/components/BuildInfo';
import LoadingSpinner from 'dashboard/components/LoadingSpinner';
import { ApplicationState } from 'dashboard/reducers';
import { firebaseUserStateChanged, updateFirestoreAuthError } from 'dashboard/reducers/auth/authActions';
import * as firebase from 'firebase';
import firebaseApp from 'firebaseApp';
import { connect, DispatchProp } from 'react-redux';
import * as Store from 'store';
import styled from 'styled-components';

import { WithTheme } from '@material-ui/core';
import logo from 'assets/images/mindhive-logo.png';

const Title = styled.h1`
  text-align: center;
  font-family: Helvetica, Arial, Verdana, Tahoma, sans-serif;
  font-weight: bold;
  font-size: 2rem;
  color: rgb(128, 131, 133);
`;

const OrienatationText = styled.p`
  text-align: center;
`;

const Copy = styled.p`
  text-align: center;
  padding: 16px;
  font-size: 0.8rem;
  color: gray;
`;

const LoginPanel = styled.div`
  width: 600px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 5px;
  padding: ${props => props.theme.pageMargin};
  display: flex;
  flex-direction: column;
  align-content: center;
`;

const Logo = styled.img`
  width: ${1280 / 3}px;
  height: ${1240 / 3}px;
  margin: auto;
`;

const StyledLink = styled.a`
  text-decoration: none;
  color: rgba(0, 0, 0, 0.7);
`;

const SIGNING_KEY = 'signingInfo';

interface SigningInfo {
  signing: boolean;
  started: number;
}
export interface LoginPageProps extends DispatchProp<any>, WithTheme {
  authenticating: boolean;

  firebaseError?: firebase.auth.Error;

  firebaseUser?: firebase.User;

  location: any;
}

interface State {
  signing: boolean;
}
class LoginPage extends React.Component<LoginPageProps, State> {
  constructor(props: LoginPageProps) {
    super(props);

    this.state = {
      signing: false,
    };
  }

  public componentDidMount() {
    try {
      const signingInfo = Store.get(SIGNING_KEY) as SigningInfo;

      let signing = false;
      if (signingInfo) {
        const delta = new Date().getTime() - signingInfo.started;
        signing = signingInfo.signing && delta < 1000 * 60;
        Store.remove(SIGNING_KEY);
      }
      this.setState({ signing });
    } catch (error) {
      console.error(error);
    }
  }

  public render() {
    const { authenticating, firebaseUser, firebaseError } = this.props;
    const { signing } = this.state;

    if (signing) {
      return <LoadingSpinner />;
    }
    return (
      <LoginPanel>
        <Logo src={logo} />
        <Title>Santra hallintakonsoli</Title>
        <OrienatationText>Kirjaudu Google-tunnuksillasi.</OrienatationText>
        <div>{firebaseError && JSON.stringify(firebaseError)}</div>
        {!firebaseUser && (
          <Button onClick={this.handleLoginClick} variant="contained" color="primary" disabled={authenticating}>
            Kirjaudu
          </Button>
        )}
        <BuildInfo />
        <Copy>
          <StyledLink href="https://www.mindhive.fi">&copy; Mindhive Oy 2019</StyledLink>
        </Copy>
      </LoginPanel>
    );
  }

  private handleLoginClick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebaseApp.auth().languageCode = 'fi';

    // const signingInfo: SigningInfo = {
    //   signing: true,
    //   started: new Date().getTime(),
    // };
    // Store.set(SIGNING_KEY, signingInfo);

    this.setState({
      signing: true,
    });

    firebaseApp
      .auth()
      .signInWithRedirect(provider)
      .then((result: any) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // var token = result.credential.accessToken;
        // The signed-in user info.
        this.props.dispatch && this.props.dispatch(firebaseUserStateChanged(result.user));
      })
      .catch((error: any) => {
        console.log(error);
        this.setState({
          signing: false,
        });

        this.props.dispatch && this.props.dispatch(updateFirestoreAuthError(error));
      });
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: Partial<LoginPageProps>) => {
  return {
    ...ownProps,
    authenticating: state.auth.authenticating,
    firebaseError: state.auth.firebaseError,
    firebaseUser: state.auth.firebaseUser,
  };
};

export default connect(mapStateToProps)(LoginPage);
