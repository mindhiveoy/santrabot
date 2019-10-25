import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ChatConfiguration } from '@shared/schema';
import * as React from 'react';
import styled from 'styled-components';

function getBorderRadiusBounds(props: any): string {
  return `${props.configuration.borderRadius}px ${props.configuration.borderRadius}px 0 0`;
}
const HeaderContainer = styled.div<Partial<HeaderProps>>`
  width: 100%;
  display: flex;
  flex-direction: row;
  color: ${props => props.configuration && props.configuration.headerColor};
  background-color: ${props => (props.configuration && props.configuration.headerBackground) || 'blue'};
  justify-content: space-between;
  border-radius: ${props => getBorderRadiusBounds(props)};
  padding: ${props => (props.configuration ? props.configuration.headerPadding : 8)}px;
`;

export interface HeaderProps {
  title: string | JSX.Element;
  open: boolean;
  configuration: ChatConfiguration;
  onToggle(minify: boolean): void;
}

const ChevronButton = styled.button`
  height: 24px;
  width: 24px;
  font-size: 24px;
  text-align: center;
  border: 0;
  background-color: transparent;

  &:focus {
    border: 0;
    outline: 0;
  }
`;

const ChevronIcon = styled(({ open, color, ...props }) => <ChevronLeftIcon {...props} />)`
  transition: 0.3s ease-in-out;
  transform: ${props => (props.open ? 'rotate3d(0, 0, 1, 90deg)' : 'rotate3d(0, 0, 1, 270deg)')};
  color: ${props => props.color};
`;

export default class Header extends React.PureComponent<HeaderProps> {
  public render() {
    const {
      configuration: { color },
      configuration,
      title,
      open,
    } = this.props;

    return (
      <HeaderContainer color={color} configuration={configuration}>
        {typeof title === 'string' ? <div dangerouslySetInnerHTML={{ __html: title }} /> : title}
        <ChevronButton onClick={this.handleToggle}>
          <ChevronIcon icon="chevron-left" open={open} color={color} />
        </ChevronButton>
      </HeaderContainer>
    );
  }

  private handleToggle = () => {
    this.props.onToggle(!this.props.open);
  }
}
