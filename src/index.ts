export { styles } from './styles';
export * from './tags';
export { compose } from './utils';
export * from './writer';

import { ConsoleWriter } from './writer';

export const { print } = new ConsoleWriter();
