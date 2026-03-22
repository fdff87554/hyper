import type {Dispatch, Middleware} from '@reduxjs/toolkit';

import type {HyperActions, HyperState} from '../../typings/hyper';
/**
 * Simple redux middleware that executes
 * the `effect` field if provided in an action
 * since this is preceded by the `plugins`
 * middleware. It allows authors to interrupt,
 * defer or add to existing side effects at will
 * as the result of an action being triggered.
 */
const effectsMiddleware: Middleware<{}, HyperState, Dispatch<HyperActions>> = () => (next) => (action: unknown) => {
  const ret = next(action);
  const act = action as HyperActions & {effect?: () => void};
  if (act.effect) {
    act.effect();
    delete act.effect;
  }

  return ret;
};
export default effectsMiddleware;
