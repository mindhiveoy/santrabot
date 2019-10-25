import { FontAwesomeIcon, Props as FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import styled from 'styled-components';

export class WrappedAwesomeIcon extends React.PureComponent<FontAwesomeIconProps | any> {
  public render() {
    return <FontAwesomeIcon className={this.props.className} icon={this.props.icon} />;
  }
}

const StyledAwesomeIcon = styled(WrappedAwesomeIcon)``;

export default StyledAwesomeIcon;
