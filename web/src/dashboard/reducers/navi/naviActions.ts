import { ActionCreator, AnyAction } from 'redux';

import { DrawerItem } from '../../components/navigation/MainScreen';
import { LinkItem } from './naviReducer';

export const enum NaviActionType {
  /**
   * Drawer toggled
   */
  NAVI_DRAWER_STATE_CHANGED = 'NAVI_DRAWER_STATE_CHANGED',
  NAVI_PATH_STATE_CHANGED = 'NAVI_PATH_STATE_CHANGED',

  NAVI_SET_NAVI_BUTTONS_FUN = 'NAVI_SET_NAVI_BUTTONS_FUN',

  /**
   * Trigger navi buttons to redraw a new state
   */
  NAVI_BUTTON_STAGE_CHANGE = 'NAVI_BUTTON_STAGE_CHANGE',
  NAVI_DRAWER_TOGGLE = 'NAVI_DRAWER_TOGGLE',

  NAVI_SET_DRAWER_ITEMS = 'NAVI_SET_DRAWER_ITEMS',
  NAVI_SET_BREADCRUMBS = 'NAVI_SET_BREADCRUMBS',
}

export interface NaviDrawerStateChangedAction extends AnyAction {
  type: NaviActionType.NAVI_DRAWER_STATE_CHANGED;
  payload: boolean;
}

export interface NaviSetDrawerItemsAction extends AnyAction {
  type: NaviActionType.NAVI_SET_DRAWER_ITEMS;
  payload: DrawerItem[];
}

export interface NaviSetBreadcrumbsAction extends AnyAction {
  type: NaviActionType.NAVI_SET_BREADCRUMBS;
  payload: LinkItem[];
}

export interface NaviDrawerToggledAction extends AnyAction {
  type: NaviActionType.NAVI_DRAWER_TOGGLE;
}

export const drawerStateChanged: ActionCreator<NaviDrawerStateChangedAction> = (drawerOpen: boolean) => ({
  type: NaviActionType.NAVI_DRAWER_STATE_CHANGED,
  payload: drawerOpen,
});

/**
 * Descriptor for Application Bar buttons shown in the Dashboard
 */
export interface NaviButtons {
  leftButtons?: JSX.Element | JSX.Element[];
  rightButtons?: JSX.Element | JSX.Element[];
}

export interface NaviSetNaviButtonsAction extends AnyAction {
  type: NaviActionType.NAVI_SET_NAVI_BUTTONS_FUN;
  payload: NaviButtons;
}

export interface NaviButtonStageChangeAction extends AnyAction {
  type: NaviActionType.NAVI_BUTTON_STAGE_CHANGE;
}
export const drawerToggle: ActionCreator<NaviDrawerToggledAction> = () => ({
  type: NaviActionType.NAVI_DRAWER_TOGGLE,
});

export const setDrawerItems: ActionCreator<NaviSetDrawerItemsAction> = (payload: DrawerItem[]) => ({
  type: NaviActionType.NAVI_SET_DRAWER_ITEMS,
  payload,
});

export const setBreadcrumbs: ActionCreator<NaviSetBreadcrumbsAction> = (payload: LinkItem[]) => ({
  type: NaviActionType.NAVI_SET_BREADCRUMBS,
  payload,
});

export const setNaviButtons: ActionCreator<NaviSetNaviButtonsAction> = (buttons: Partial<NaviButtons>) => ({
  type: NaviActionType.NAVI_SET_NAVI_BUTTONS_FUN,
  payload: {
    ...buttons,
  },
});

export const naviButtonStageChange: ActionCreator<NaviButtonStageChangeAction> = () => ({
  type: NaviActionType.NAVI_BUTTON_STAGE_CHANGE,
});

export type NaviAction =
  | AnyAction
  | NaviDrawerStateChangedAction
  | NaviDrawerToggledAction
  | NaviSetNaviButtonsAction
  | NaviButtonStageChangeAction;
