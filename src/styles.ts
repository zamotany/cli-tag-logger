import colorette from 'colorette';
import { mergeStringsWithValues } from './utils';

const coloretteStyles = Object.entries(colorette).filter(
  ([, value]) => typeof value === 'function'
) as Array<[string, colorette.Style]>;

export const styles = coloretteStyles.reduce((acc, [key, style]) => {
  return {
    ...acc,
    [key]: (strings: TemplateStringsArray, ...values: any[]) => {
      colorette.options.enabled = !process.env.NO_COLOR;
      return style(mergeStringsWithValues(undefined, strings, values));
    },
  };
}, {} as { [K in keyof Omit<typeof colorette, 'options'>]: typeof String.raw });
