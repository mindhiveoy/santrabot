import * as React from 'react';

import styled from 'styled-components';

interface BalloonProps {
  delay: number;
}

const Balloon = styled.span<BalloonProps>`
  border-radius: 50%;
  background-color: grey;
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 2px;

  animation: balloon-anim 1.4s infinite ease-in-out both;
  transition: all 0.3s;
  animation-delay: ${props => (props.delay ? -0.2 * props.delay : 0)}s;

  @keyframes balloon-anim {
    0%,
    80%,
    100% {
      transform: scale(0.4);
    }

    40% {
      transform: scale(1);
    }
  }
`;

const WritingDiv = styled.div<WritingProps>`
  margin: 8px;
  display: ${props => (props.active ? 'inline-block' : 'none')};
  transition: all 1s;
  opacity: ${props => (props.active ? 1 : 0)};
  max-height: ${props => !props.active && 0};
`;

export interface WritingProps {
  /**
   * True if indicator is active. Default value is true.
   */
  active?: boolean;
}

/**
 * Simple writing indicator to be used with chat
 *
 * @author Ville Venäläinen
 */
export default class Writing extends React.PureComponent<WritingProps> {
  public static defaultProps: WritingProps = {
    active: false,
  };

  public render() {
    const { active } = this.props;
    return (
      <WritingDiv active={active}>
        <Balloon delay={0} />
        <Balloon delay={1} />
        <Balloon delay={2} />
      </WritingDiv>
    );
  }
}
