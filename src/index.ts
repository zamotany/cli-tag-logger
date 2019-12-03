import utils from 'util';
import colorette from 'colorette';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import stripAnsi from 'strip-ansi';

const coloretteStyles = Object.entries(colorette).filter(
  ([, value]) => typeof value === 'function'
) as Array<[string, colorette.Style]>;

function stringify(value: any): string {
  return typeof value === 'string'
    ? value
    : utils.inspect(value, {
        depth: null,
        maxArrayLength: Infinity,
        colors: !process.env.NO_COLOR,
      });
}

function mergeStringsWithValues(
  prefix: (() => string) | undefined,
  strings: TemplateStringsArray,
  values: any[]
): string {
  const stringifiedValues = values.map(stringify);

  const segments: string[] = new Array(
    strings.length + stringifiedValues.length + (prefix ? 1 : 0)
  );

  if (prefix) {
    segments[0] = prefix();
  }

  for (let i = 0, j = prefix ? 1 : 0; i < strings.length; i++) {
    segments[j++] = strings[i];
    if (stringifiedValues[i]) {
      segments[j++] = stringifiedValues[i];
    }
  }

  return segments.join('');
}

export const styles = coloretteStyles.reduce((acc, [key, style]) => {
  return {
    ...acc,
    [key]: (strings: TemplateStringsArray, ...values: any[]) => {
      colorette.options.enabled = !process.env.NO_COLOR;
      return style(mergeStringsWithValues(undefined, strings, values));
    },
  };
}, {} as { [K in keyof Omit<typeof colorette, 'options'>]: typeof String.raw });

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

export type ComposableValues = Array<
  string | number | false | null | undefined | object
>;

export function compose(...values: ComposableValues): string {
  return values
    .map(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString();
      }

      if (value === false || value === null || value === undefined) {
        return '';
      }

      return stringify(value);
    })
    .filter(Boolean)
    .join(' ');
}

const emitter = new EventEmitter();
const consolePrint = (message: any) => {
  console.log(message);
};
emitter.on('print', consolePrint);

export type Configuration = {
  // verbose?: boolean;
  console?: boolean;
  file?: string;
  json?: boolean;
  listener?: (type: 'print', message: string) => void;
};

export function configure(options: Configuration): () => void {
  const {
    console: logToConsole = true,
    file,
    json,
    // verbose,
    listener,
  } = options;
  let dispose = () => {};

  if (!logToConsole) {
    emitter.removeListener('print', consolePrint);
  }

  if (file) {
    const filename = path.isAbsolute(file) ? file : path.resolve(file);
    const fileListener = (message: string) => {
      const data = json
        ? JSON.stringify({ timestamp: new Date(), message: stripAnsi(message) })
        : `${new Date().toJSON()} ${stripAnsi(message)}`;
      fs.appendFileSync(filename, data + '\n');
    };
    emitter.on('print', fileListener);
    dispose = () => {
      emitter.off('print', fileListener);
    };
  }

  if (listener) {
    emitter.on('print', listener);
  }

  return dispose;
}

export function print(...values: ComposableValues) {
  emitter.emit('print', compose(...values));
}
