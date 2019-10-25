import { BotLogLine, BotLogType } from 'dashboard/reducers/bot-log/botLogActions';
import moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';

function getColorForType(type: BotLogType) {
  switch (type) {
    case BotLogType.INFO:
      return 'white';
    case BotLogType.WARN:
      return 'yellow';
    case BotLogType.ERROR:
      return 'red';
    default:
      console.error(`Unidentified BotLogType: ${type}`);
      return 'orange';
  }
}

const LineContainer = styled.div<Partial<BotLogLine>>`
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  color: ${props => getColorForType(props.type!)};
`;

export interface LogLineProps {
  line: BotLogLine;
}

export default class LogLine extends React.PureComponent<LogLineProps> {
  public render() {
    const {
      line: { date, type, message },
    } = this.props;

    return (
      <LineContainer type={type}>
        {moment(date).format('h:mm:ss')}: {message}
      </LineContainer>
    );
  }
}
