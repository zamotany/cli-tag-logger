import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import stripAnsi from 'strip-ansi';

import { compose, ComposableValues } from './utils';

export type Configuration = {
  // verbose?: boolean;
  console?: boolean;
  file?: string | false;
  json?: boolean;
  listener?: (type: 'print', message: string) => void;
};

export class Writer {
  private emitter = new EventEmitter();
  private filePrint: ((message: any) => void) | undefined;
  private consolePrint = (message: any) => {
    console.log(message);
  };

  constructor() {
    this.emitter.on('print', this.consolePrint);
  }

  applyOptions(options: Configuration) {
    if (
      options.console &&
      !this.emitter.listeners('print').includes(this.consolePrint)
    ) {
      this.emitter.on('print', this.consolePrint);
    } else if (options.console === false) {
      this.emitter.off('print', this.consolePrint);
    }

    if (options.file) {
      if (this.filePrint) {
        this.emitter.off('print', this.filePrint);
        this.filePrint = undefined;
      }

      const filename = path.isAbsolute(options.file)
        ? options.file
        : path.resolve(options.file);
      this.filePrint = (message: any) => {
        const data = options.json
          ? JSON.stringify({
              timestamp: new Date(),
              message: stripAnsi(message),
            })
          : `${new Date().toJSON()} ${stripAnsi(message)}`;
        fs.appendFileSync(filename, data + '\n');
      };
      this.emitter.on('print', this.filePrint);
    } else if (options.file === false && this.filePrint) {
      this.emitter.off('print', this.filePrint);
      this.filePrint = undefined;
    }

    if (options.listener) {
      this.emitter.on('print', message => options.listener!('print', message));
    }
  }

  print(...values: ComposableValues) {
    this.emitter.emit('print', compose(...values));
  }
}

const writer = new Writer();

export function configure(options: Configuration) {
  writer.applyOptions(options);
}

export function print(...values: ComposableValues) {
  writer.print(...values);
}
