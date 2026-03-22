import {combineReducers} from '@reduxjs/toolkit';

import sessions from './sessions';
import termGroups from './term-groups';
import ui from './ui';

const rootReducer = combineReducers({
  ui,
  sessions,
  termGroups
});

export default rootReducer;
