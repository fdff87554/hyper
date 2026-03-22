import {configureStore} from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';

import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';

import writeMiddleware from './write-middleware';

const configureStoreForDevelopment = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({serializableCheck: false, immutableCheck: false}).concat(
        plugins.middleware,
        thunk,
        writeMiddleware,
        effects
      ),
    devTools: true
  });
};

export default configureStoreForDevelopment;
