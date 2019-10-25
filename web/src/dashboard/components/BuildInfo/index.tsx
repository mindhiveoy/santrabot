import * as React from 'react';
import styled from 'styled-components';

const BuildInfOPanel = styled('div')`
  border-radius: 4px;
  background-color: lightgrey;
  margin: 16px;
  padding: 8px 16px 8px 16px;
`;

const BuildLine = styled('div')`
  margin: 4px;
`;

export interface BuildInfoProps {
  showInProduction: boolean;
  /**
   * Show all available info (default is false)
   */
  showAll: boolean;
  /**
   * Show build environment (default true)
   */
  showEnvironment: boolean;
}

export default class BuildInfo extends React.PureComponent<BuildInfoProps> {
  public static defaultProps: BuildInfoProps = {
    showInProduction: false,
    showAll: false,
    showEnvironment: true,
  };

  public render() {
    const { showAll, showEnvironment } = this.props;

    return this.showInfo()
      ? CONFIG.build.environment !== 'production' && (
          <BuildInfOPanel>
            {showAll || (showEnvironment && <BuildLine>environment: {CONFIG.build.environment}</BuildLine>)}
            {showAll && (
              <>
                <BuildLine>version: {CONFIG.build.version}</BuildLine>
                <BuildLine>build: {CONFIG.build.build}</BuildLine>
                <BuildLine>sha1: {CONFIG.build.sha1}</BuildLine>
                <BuildLine>branch: {CONFIG.build.branch}</BuildLine>
                <BuildLine>tag: {CONFIG.build.tag}</BuildLine>
              </>
            )}
          </BuildInfOPanel>
        )
      : null;
  }

  private showInfo = () => {
    return CONFIG.build.environment !== 'production' || this.props.showInProduction;
  }
}
