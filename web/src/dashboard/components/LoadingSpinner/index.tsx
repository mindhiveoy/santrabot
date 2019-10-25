import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 7rem;
`;

const Progress = styled.div`
  align-items: center;
  height: 50%;
`;

const Circle = styled<any>(CircularProgress)`
  display: block;
  margin: auto;
`;

const Message = styled.div`
  padding-top: 2rem;
  color: gray;
`;

export interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export default class LoadingSpinner extends React.PureComponent<
  LoadingSpinnerProps
> {
  public render() {
    const { size = 40, message } = this.props;
    return (
      <Container>
        <Progress>
          <Circle size={size} />
          {message && <Message>{message}</Message>}
        </Progress>
      </Container>
    );
  }
}
