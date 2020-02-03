import stripAnsi from 'strip-ansi';

export type LevelTag = 'debug' | 'info' | 'success' | 'warn' | 'error' | RegExp;

export type FilterOptions = {
  only?: LevelTag | LevelTag[];
  exclude?: LevelTag | LevelTag[];
};

export type Tester = (message: string) => boolean;

export type FilterConfig = FilterOptions | Tester;

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function createTester(config: FilterConfig = {}): Tester {
  if (typeof config === 'function') {
    return message => config(stripAnsi(message));
  }

  if (config.exclude === undefined && config.only === undefined) {
    return () => true;
  }

  return message => {
    const value = stripAnsi(message);

    let include = toArray(config.only || [/.*/]).some(spec => {
      if (typeof spec === 'string') {
        return value.startsWith(spec);
      }

      return spec.test(value);
    });

    if (!include) {
      return false;
    }

    include = !toArray(config.exclude || []).some(spec => {
      if (typeof spec === 'string') {
        return value.startsWith(spec);
      }

      return spec.test(value);
    });

    return include;
  };
}
