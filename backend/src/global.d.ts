/**
 * Following Node and StyleSheet are required because of bug in styledcomponent -definition:
 *
 * https://github.com/DefinitelyTyped/DefinitelyTyped/pull/29022
 */
declare interface Node {}

declare interface StyleSheet {}

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

  unsplash: {
    app_id: string;
    apiURL: string;
  };
}

/**
 * Global configuration settings
 */
declare const CONFIG: AppConfiguration;
