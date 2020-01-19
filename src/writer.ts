import path from 'path';
import fs from 'fs';
import stripAnsi from 'strip-ansi';
import onExit from 'signal-exit';

import { compose, ComposableValues } from './utils';

export abstract class Writer {
  onPrint(_message: string) {
    throw new Error('onPrint method from Writer class must be implemented');
  }

  print = (...values: ComposableValues) => {
    this.onPrint(compose(...values));
  };
}

export class ConsoleWriter extends Writer {
  onPrint(message: string) {
    console.log(message);
  }
}

export class FileWriter extends Writer {
  private fd?: number;

  constructor(
    public readonly filename: string,
    public readonly json: boolean = false
  ) {
    super();
    this.filename = path.isAbsolute(filename)
      ? filename
      : path.resolve(filename);
    this.fd = fs.openSync(this.filename, 'a');
    onExit(() => {
      this.fd !== undefined && fs.closeSync(this.fd);
    });
  }

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

export class ComposeWriter extends Writer {
  writers: Writer[];

  constructor(...writers: Writer[]) {
    super();
    this.writers = writers;
  }

  onPrint(message: string) {
    this.writers.forEach(writer => writer.onPrint(message));
  }
}
