import type {Dispatch, Middleware} from '@reduxjs/toolkit';

import type {HyperActions, HyperState} from '../../typings/hyper';
import terms from '../terms';

// the only side effect we perform from middleware
// is to write to the react term instance directly
// to avoid a performance hit
const writeMiddleware: Middleware<{}, HyperState, Dispatch<HyperActions>> = () => (next) => (action: unknown) => {
  const act = action as HyperActions;
  if (act.type === 'SESSION_PTY_DATA') {
    const term = terms[act.uid];
    if (term) {
      term.term.write(act.data);
    }
  }
  next(action);
};

export default writeMiddleware;
