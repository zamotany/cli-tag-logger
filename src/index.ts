export { styles } from './styles';
export * from './tags';
export { compose } from './utils';
export * from './writer';
export { FilterConfig, FilterOptions, Tester, LevelTag } from './filter';

import { ConsoleWriter } from './writer';

export const { print } = new ConsoleWriter();
