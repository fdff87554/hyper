import {produce} from 'immer';

import {
  SESSION_ADD,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_PTY_DATA,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_RESIZE,
  SESSION_SET_XTERM_TITLE,
  SESSION_SET_CWD,
  SESSION_SEARCH
} from '../../typings/constants/sessions';
import type {sessionState, session, ISessionReducer} from '../../typings/hyper';
import {decorateSessionsReducer} from '../utils/plugins';

const initialState: sessionState = {
  sessions: {},
  activeUid: null
};

function createSession(obj: Partial<session>): session {
  return {
    uid: '',
    title: '',
    cols: null,
    rows: null,
    cleared: false,
    search: false,
    shell: '',
    pid: null,
    profile: '',
    ...obj
  };
}

const reducer: ISessionReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SESSION_ADD:
        draft.activeUid = action.uid;
        draft.sessions[action.uid] = createSession({
          cols: action.cols,
          rows: action.rows,
          uid: action.uid,
          shell: action.shell ? action.shell.split('/').pop() : null,
          pid: action.pid,
          profile: action.profile
        });
        break;

      case SESSION_SET_ACTIVE:
        draft.activeUid = action.uid;
        break;

      case SESSION_SEARCH:
        draft.sessions[action.uid].search = action.value;
        break;

      case SESSION_CLEAR_ACTIVE:
        if (draft.activeUid && draft.sessions[draft.activeUid]) {
          draft.sessions[draft.activeUid].cleared = true;
        }
        break;

      case SESSION_PTY_DATA:
        // we avoid a direct merge for perf reasons
        // as this is the most common action
        if (state.sessions[action.uid]?.cleared) {
          draft.sessions[action.uid].cleared = false;
        }
        break;

      case SESSION_PTY_EXIT:
        if (state.sessions[action.uid]) {
          delete draft.sessions[action.uid];
        } else {
          console.log('ignore pty exit: session removed by user');
        }
        break;

      case SESSION_USER_EXIT:
        delete draft.sessions[action.uid];
        break;

      case SESSION_SET_XTERM_TITLE:
        // we need to trim the title because `cmd.exe`
        // likes to report ' ' as the title
        draft.sessions[action.uid].title = action.title.trim();
        break;

      case SESSION_RESIZE:
        Object.assign(draft.sessions[action.uid], {
          rows: action.rows,
          cols: action.cols,
          resizeAt: action.now
        });
        break;

      case SESSION_SET_CWD:
        if (state.sessions[action.uid]) {
          draft.sessions[action.uid].cwd = action.cwd;
        }
        break;
    }
  });

export default decorateSessionsReducer(reducer);
