import utils from 'util';

export function stringify(value: any): string {
  return typeof value === 'string'
    ? value
    : utils.inspect(value, {
        depth: null,
        maxArrayLength: Infinity,
        colors: !process.env.NO_COLOR,
      });
}

export function mergeStringsWithValues(
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
