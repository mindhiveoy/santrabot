import { fade } from '@material-ui/core/styles/colorManipulator';
import * as React from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';
import theme from 'theme';

const StyledLink = styled(Link)`
  margin: 0;
  color: ${fade(theme.palette.primary.contrastText, 0.7)};
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: ${theme.typography.fontFamily};
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease-in-out;

  :hover {
    color: ${theme.palette.primary.contrastText};
  }
`;

const ActiveLink = styled.span`
  margin: 0;
  padding: 0.5rem;
  font-size: 1rem;
  font-family: ${theme.typography.fontFamily};
  font-weight: 600;
  color: ${theme.palette.primary.contrastText};
  cursor: default;
  text-decoration: none;
`;

interface BreadcrumbsItemProps {
  active?: boolean;
  index: number;
  label: string;
  uri: string;
}

export default class BreadcrumbsItem extends React.PureComponent<BreadcrumbsItemProps> {
  public displayName: string = 'BreadcrumbsItem';

  public render() {
    const { active, label, uri } = this.props;

    if (active) {
      return <ActiveLink>{label}</ActiveLink>;
    }
    return (
      <StyledLink to={uri} title={label}>
        {label}
      </StyledLink>
    );
  }
}
