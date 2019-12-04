import { mergeStringsWithValues, compose } from './utils';
import { styles } from './styles';

export function createTag(prefix?: () => string) {
  return (strings: TemplateStringsArray, ...values: any[]): string => {
    return mergeStringsWithValues(prefix, strings, values);
  };
}

export const debug = createTag(() => styles.gray`debug `);
export const info = createTag(() => styles.blue`info `);
export const warn = createTag(() => styles.yellow`warn `);
export const error = createTag(() => styles.red`error `);
export const success = createTag(() => styles.green`success `);
export const inspect = createTag();
export const trace = (
  strings: TemplateStringsArray,
  ...values: any[]
): string => {
  const err = {
    name: '',
    stack: undefined,
  };
  Error.captureStackTrace(err, trace);
  return compose(
    mergeStringsWithValues(() => styles.magenta`trace `, strings, values),
    err.stack
  );
};
