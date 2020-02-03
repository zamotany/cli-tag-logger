import path from 'path';
import fs from 'fs-extra';
import stripAnsi from 'strip-ansi';
import onExit from 'signal-exit';

import { compose, ComposableValues } from './utils';
import { FilterConfig, Tester, createTester } from './filter';

export abstract class Writer {
  private tester: Tester;

  constructor({ filter }: { filter?: FilterConfig } = {}) {
    this.tester = createTester(filter);
  }

  onPrint(_message: string) {
    throw new Error('onPrint method from Writer class must be implemented');
  }

  print = (...values: ComposableValues) => {
    const message = compose(...values);
    if (this.tester(message)) {
      this.onPrint(message);
    }
  };
}

export function composeWriters<
  MainWriter extends Writer,
  OtherWriter extends Writer
>(main: MainWriter, ...writers: OtherWriter[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { print, onPrint: _onPrint, ...exposedValues } = main;

  // Filter out functions exposed on MainWriter
  type ExposedValues = typeof exposedValues;
  const exposedFunctions: {
    [FnKey in keyof ExposedValues]: ExposedValues[FnKey] extends Function
      ? ExposedValues[FnKey]
      : never;
  } = Object.entries<unknown>(exposedValues)
    .filter(([, value]) => typeof value === 'function')
    .reduce((acc, [key, fn]) => ({ ...acc, [key]: fn }), {}) as any;

  return {
    print: (...values: ComposableValues) => {
      const message = compose(...values);
      print(message);
      writers.forEach(writer => writer.print(message));
    },
    ...exposedFunctions,
  };
}

export class ConsoleWriter extends Writer {
  constructor({ filter }: { filter?: FilterConfig } = {}) {
    super({ filter });
  }

  onPrint(message: string) {
    console.log(message);
  }
}

export class FileWriter extends Writer {
  private fd?: number;
  public readonly json: boolean;

  constructor(
    public readonly filename: string,
    { filter, json }: { filter?: FilterConfig; json?: boolean } = {}
  ) {
    super({ filter });
    this.json = Boolean(json);
    this.filename = path.isAbsolute(filename)
      ? filename
      : path.resolve(filename);
    fs.ensureFileSync(this.filename);
    this.fd = fs.openSync(this.filename, 'a');
    onExit(this.close);
  }

  close = () => {
    this.fd !== undefined && fs.closeSync(this.fd);
    this.fd = undefined;
  };

  onPrint(message: string) {
    const data = this.json
      ? JSON.stringify({
          timestamp: new Date(),
          message: stripAnsi(message),
        })
      : `${new Date().toJSON()} ${stripAnsi(message)}`;
    this.fd !== undefined && fs.appendFileSync(this.fd, data + '\n');
  }
}
