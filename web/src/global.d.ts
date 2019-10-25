interface AppBuildInfo {
  /**
   * Build's target environment
   */
  environment: 'development' | 'staging' | 'production';

  /**
   * Version number included on project's package.json
   */
  version: string;

  /**
   * Build number given by circle ci
   */
  build: number;
  /**
   * Git tag if any
   */
  tag?: string;

  /**
   * Git's sha for commit used to create the build. Github itself will show in the ui a short form of this hash.
   * This hash number is first seven digits of this number.
   */
  sha1?: string;

  /**
   * Name of the repository used in build
   */
  repoName: string;

  /**
   * Build source branch
   */
  branch: string;
}

/**
 * Global configuration set on build time for the app. Use $root/config/ -folder configurations
 * to configure these settings for different target builds.
 *
 * @author Ville Venäläinen
 */
interface AppConfiguration {
  /**
   * Current environment
   */
  build: AppBuildInfo;
  /**
   * Firebase configuration needed to communicate with back end
   */
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    messagingSenderId: string;
    projectId: string;
    storageBucket: string;
  };
}

/**
 * Global configuration settings
 */
declare const CONFIG: AppConfiguration;

declare module '*.gql';

declare interface RiveFile {
  name: string;
  data: string;
}

declare module 'autoscroll-react';

declare module 'material-ui-chip-input';

declare module 'deepcopy';
