import DomainIcon from '@material-ui/icons/Domain';
import { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import * as React from 'react';
import { Reducer } from 'redux';
import { DrawerItemVariant } from '../../components/navigation/MainScreen/index';
import { NaviAction, NaviActionType, NaviButtons } from './naviActions';

export interface LinkItem {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export interface NaviState extends NaviButtons {
  /**
   * True if app's drawer is open.
   */
  readonly drawerOpen: boolean;

  /**
   * Current set of breadcrumbs
   */
  readonly breadCrumbs: LinkItem[];

  /**
   * Current set of drawerItems
   */
  readonly drawerItems: DrawerItem[];

  /**
   * Change trigger navibar changes
   */
  readonly change: number;
}

const defaultState: NaviState = {
  drawerOpen: false,
  breadCrumbs: [],
  drawerItems: [
    {
      variant: DrawerItemVariant.ACTION,
      title: 'Hallintakonsoli',
      icon: <DomainIcon />,
      page: '/mindhive/bot',
    },
  ],
  change: 0,
};

export const navi: Reducer<NaviState> = (state = defaultState, action: NaviAction): NaviState => {
  switch (action.type) {
    case NaviActionType.NAVI_DRAWER_STATE_CHANGED: {
      return {
        ...state,
        drawerOpen: action.payload,
      };
    }

    case NaviActionType.NAVI_SET_DRAWER_ITEMS: {
      return {
        ...state,
        drawerItems: action.payload,
      };
    }

    case NaviActionType.NAVI_SET_BREADCRUMBS: {
      return {
        ...state,
        breadCrumbs: action.payload,
      };
    }

    case NaviActionType.NAVI_DRAWER_TOGGLE: {
      return {
        ...state,
        drawerOpen: !state.drawerOpen,
      };
    }

    case NaviActionType.NAVI_SET_NAVI_BUTTONS_FUN: {
      return {
        ...state,
        ...action.payload,
      };
    }

    case NaviActionType.NAVI_BUTTON_STAGE_CHANGE: {
      const change = state.change < 1000000 ? state.change + 1 : 0;
      return {
        ...state,
        change,
      };
    }

    default:
      return state;
  }
};
