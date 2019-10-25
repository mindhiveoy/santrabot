/**
 * # Theme
 *
 * Theming of project
 *
 * @author Ville Venäläinen
 */

import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';

export const drawerWidth = 240;

export const MOBILE_PORTRAIT_TRESHOLD = 480;
export const MOBILE_LANDSCAPE_TRESHOLD_W = 660;
export const MOBILE_LANDSCAPE_TRESHOLD_H = 480;

export function isMobileScreen(): boolean {
  return window && window.innerWidth < MOBILE_PORTRAIT_TRESHOLD;
}
export interface ThemeInterface {
  primaryColor: string;

  secondaryColor: string;

  primaryText: string;

  linkColor: string;

  backgroundColor: string;
  /**
   * Width of drawer menu
   */
  drawerWidth: number;

  drawerWidthMinified: number;
  /**
   * Margins on the whole page from window border
   */
  pageMargin: number;

  formFieldPadding: number;

  /**
   * Theme for user's own chat text bubbles
   */
  bubbleMe: BubbleTheme;

  /**
   * Theme for bot's chat text bubbles
   */
  bubbleBot: BubbleTheme;

  input: {
    fontSize: string;
    borderColor: string;
  };
}

/**
 * Theme for a chat bubble
 */
export interface BubbleTheme {
  /**
   * Text color
   */
  color: string;
  /**
   * Background color
   */
  backgroundColor: string;

  /**
   * Text padding inside the bubble
   */
  padding: string;
}

export const PRIMARY_COLOR = '#3f51b5';

export const SECONDARY_COLOR = '#f50057';

const muiTheme: Theme = createMuiTheme({
  palette: {
    common: { black: '#000', white: '#fff' },
    background: { paper: '#fff', default: '#fafafa' },
    primary: {
      light: PRIMARY_COLOR,
      main: PRIMARY_COLOR,
      dark: PRIMARY_COLOR,
      contrastText: '#fff',
    },
    secondary: {
      light: SECONDARY_COLOR,
      main: SECONDARY_COLOR,
      dark: SECONDARY_COLOR,
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: 'rgba(245, 130, 30, 1)',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
  },
});

export enum CssBreakpoint {
  PHONE = '320px',
  TABLET_SMALL = '481px',
  TABLET_PORTRAIT = '641px',
  TABLET_LANDSCAPE = '961px',
  DESKTOP = '1025px',
  DESKTOP_HIGH = '1281px',
}

export interface AppTheme extends Theme, ThemeInterface {}

export const theme: AppTheme = {
  ...muiTheme,

  primaryColor: '#9DCFa8',

  secondaryColor: '#1FFF31',

  primaryText: 'black',

  backgroundColor: 'white', // '#D7EDDD',

  linkColor: 'blue',

  pageMargin: 16,

  drawerWidth: 240,

  drawerWidthMinified: 57,

  formFieldPadding: 16,

  bubbleMe: {
    color: 'white',
    backgroundColor: 'lightgreen',
    padding: '8px',
  },

  bubbleBot: {
    color: 'white',
    backgroundColor: 'lightblue',
    padding: '8px',
  },

  input: {
    fontSize: '18px',
    borderColor: 'lightgray',
  },
};
export default theme;
