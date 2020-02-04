import mkdir from 'mkdirp';
import del from 'del';
import path from 'path';
import fs from 'fs';
import * as log from '../src';
import { terminal } from 'terminal-kit';

jest.mock('terminal-kit', () => ({
  terminal: jest.fn(),
}));

describe('cli-tag-logger', () => {
  beforeAll(() => {
    process.env.NO_COLOR = '1';
  });

  it('should provide styling tags', () => {
    expect(log.styles).toMatchSnapshot();
    expect(log.styles.red`hello`).toEqual('hello');
  });

  it('should provide debug, info, success, warn, error tags', () => {
    expect(log.debug`hello ${1}`).toEqual('debug hello 1');
    expect(log.info`hello ${{ a: 1 }}`).toEqual('info hello { a: 1 }');
    expect(log.success`hello ${/regex/}`).toEqual('success hello /regex/');
    expect(log.warn`hello ${function a() {}}`).toEqual(
      'warn hello [Function: a]'
    );
    expect(log.error`hello`).toEqual('error hello');
  });

  it('should provie trace and inspect tags', () => {
    expect(log.inspect`hello ${{ a: 1 }}`).toEqual('hello { a: 1 }');
    expect(log.trace`hello`).toMatch(/trace hello Error:(\s*at .+\s*)+/);
  });

  it('should allow to compose messages', () => {
    expect(
      log.compose(
        'hello',
        log.debug`test`,
        0,
        null,
        undefined,
        false,
        { a: 1 },
        class A {}
      )
    ).toEqual('hello debug test 0 { a: 1 } [Function: A]');
  });

  it('should print message to console', () => {
    const _log = console.log;
    console.log = jest.fn();

    log.print(log.info`hello`, 'world');
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('info hello world');

    console.log = _log;
  });

  it('should print message to console with filters', () => {
    const _log = console.log;
    console.log = jest.fn();

    const { print } = new log.ConsoleWriter({
      filter: {
        only: 'success',
      },
    });

    print(log.info`hello`, 'world');
    print(log.success`hello`, 'world');
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('success hello world');

    console.log = _log;
  });

  it('should write message to file', () => {
    const dir = `test/tmp-${(Math.random() * 10000).toFixed(0)}`;
    const absDir = path.resolve(dir);
    mkdir.sync(absDir);

    const { print, close } = new log.FileWriter(path.join(dir, 'out.log'));

    print('hello');

    expect(fs.readFileSync(path.join(absDir, 'out.log'), 'utf8')).toMatch(
      'hello'
    );

    close();
    del.sync(absDir);
  });

  it('should write message to file as json', () => {
    const dir = `test/tmp-${(Math.random() * 10000).toFixed(0)}`;
    const absDir = path.resolve(dir);
    mkdir.sync(absDir);

    const { print, close } = new log.FileWriter(path.join(dir, 'out.log'), {
      json: true,
    });

    print('hello');

    expect(fs.readFileSync(path.join(absDir, 'out.log'), 'utf8')).toMatch(
      /\{"timestamp":".*","message":"hello"\}/
    );

    close();
    del.sync(absDir);
  });

  it('should compose writers', () => {
    class CustomWriter extends log.Writer {
      data: string[] = [];

      onPrint(message: string) {
        this.data.push(message);
      }
    }

    const writer1 = new CustomWriter();
    const writer2 = new CustomWriter();
    const { print } = log.composeWriters(writer1, writer2);

    print('hello');

    expect(writer1.data).toEqual(['hello']);
    expect(writer2.data).toEqual(['hello']);
  });

  it('should render spinner', () =>
    new Promise(resolve => {
      const actions = [];

      ((terminal as unknown) as jest.Mock).mockImplementation((...args) => {
        actions.push(['terminal', args]);
      });
      terminal.width = 100;
      ((terminal as unknown) as jest.Mock & {
        eraseLine: Function;
      }).eraseLine = jest.fn((...args) => {
        actions.push(['eraseLine', args]);
      });
      ((terminal.move as unknown) as jest.Mock) = jest.fn((...args) => {
        actions.push(['move', args]);
      });
      ((terminal as unknown) as jest.Mock & {
        hideCursor: Function;
      }).hideCursor = jest.fn();

      const {
        print,
        startSpinner,
        stopSpinner,
        updateSpinner,
      } = log.composeWriters(new log.InteractiveWriter());

      print('message 1');

      startSpinner('start', { interval: 5 });

      setTimeout(() => {
        print('message 2');
      }, 10);

      setTimeout(() => {
        updateSpinner('update');
      }, 20);

      setTimeout(() => {
        stopSpinner();
        print('message 3');

        expect(terminal.eraseLine).toHaveBeenCalledTimes(12);
        expect(terminal.move).toHaveBeenCalledTimes(12);
        expect(terminal).toHaveBeenCalledTimes(11);
        expect(terminal.hideCursor).toHaveBeenCalledTimes(2);

        expect(
          actions.map(item => `${item[0]}: ${item[1].join('')}`)
        ).toMatchSnapshot();

        resolve();
      }, 40);

      expect(true).toBe(true);
    }));
});
