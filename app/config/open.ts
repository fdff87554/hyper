import {shell} from 'electron';

import {cfgPath} from './paths';

const openConfig = () => shell.openPath(cfgPath).then((error) => error === '');

export default openConfig;
