import autoscroll from 'autoscroll-react';
import { ApplicationState } from 'dashboard/reducers';
import { BotLogLine } from 'dashboard/reducers/bot-log/botLogActions';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import LogLine from './LogLine';

const LogContainer = styled.div`
  background-color: gray;
  padding: 8px;
  height: 200px;
  overflow-y: scroll;
`;

export interface LogPanelProps {
  log: BotLogLine[];
}

class LogPanel extends React.Component<LogPanelProps, any> {
  public render() {
    return (
      <LogContainer {...this.props}>
        {this.props.log.map((line, index) => (
          <LogLine line={line} key={index} />
        ))}
      </LogContainer>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    log: state.botLog.log,
  };
};

export default connect(mapStateToProps)(autoscroll(LogPanel));
