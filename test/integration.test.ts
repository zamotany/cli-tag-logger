import mkdir from 'mkdirp';
import del from 'del';
import path from 'path';
import fs from 'fs';
import * as log from '../src';

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
});
