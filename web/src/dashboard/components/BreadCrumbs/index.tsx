import * as React from 'react';

import { WithTheme } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import BreadcrumbsItem from './BreadcrumbsItem';

const Navi = styled.nav`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  height: 1.25rem;
  margin: 0;
  padding: 0 0.5rem;

  background-color: transparent;
`;

export interface BreadcrumbStep {
  label: string;
  uri: string;
}

interface BreadcrumbsProps extends WithTheme, RouteComponentProps<any> {
  steps: BreadcrumbStep[];
  minified?: boolean;
}

class Breadcrumbs extends React.PureComponent<BreadcrumbsProps, any> {
  public static defaultProps: Partial<BreadcrumbsProps> = {
    steps: [],
  };
  public displayName: string = 'Breadcrumbs';

  public render() {
    const { steps = [], minified = false } = this.props;
    return (
      <Navi>
        {minified
          ? this.renderMinified()
          : steps.map((step: BreadcrumbStep, index: number) => {
              return [
                index !== 0 ? <ChevronRightIcon key={index + 's'} /> : null,
                <BreadcrumbsItem
                  key={index}
                  active={index === steps.length - 1}
                  index={index}
                  label={step.label}
                  uri={step.uri}
                />,
              ];
            })}
      </Navi>
    );
  }

  private renderMinified = () => {
    const { steps = [] } = this.props;

    switch (steps.length) {
      case 0: {
        return null;
      }
      case 1:
        return <BreadcrumbsItem key={0} active index={0} label={steps[0].label} uri={steps[0].uri} />;

      default: {
        const index = steps.length - 1;

        return [
          <ChevronLeftIcon key={index - 1} onClick={this.handleChevronClick(steps[index - 1].uri)} />,

          <BreadcrumbsItem key={index} active index={index} label={steps[index].label} uri={steps[index].uri} />,
        ];
      }
    }
  }

  private handleChevronClick = (uri: string) => () => {
    const { history } = this.props;
    history.push(uri);
  }
}

export default withRouter(Breadcrumbs);
