import {configureStore} from '@reduxjs/toolkit';

import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';

import writeMiddleware from './write-middleware';

const configureStoreForProd = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({serializableCheck: false, immutableCheck: false}).concat(
        plugins.middleware,
        writeMiddleware,
        effects
      ),
    devTools: false
  });

export default configureStoreForProd;
