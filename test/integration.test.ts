import mkdir from 'mkdirp';
import del from 'del';
import path from 'path';
import fs from 'fs';
import * as log from '../src';

describe('cli-tag-logger', () => {
  beforeAll(() => {
    process.env.NO_COLOR = '1';
  });

  beforeEach(() => {
    log.configure({ console: true, file: false });
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

  it('should print message', () => {
    const _log = console.log;
    console.log = jest.fn();

    log.print(log.info`hello`, 'world');
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('info hello world');

    console.log = _log;
  });

  it('should disable print to console', () => {
    const _log = console.log;
    console.log = jest.fn();

    log.configure({ console: false });
    log.print(log.info`hello`, 'world');
    expect(console.log).not.toHaveBeenCalled();

    console.log = _log;
  });

  it('should allow printing to file', () => {
    const dir = `test/tmp-${(Math.random() * 10000).toFixed(0)}`;
    const absDir = path.resolve(dir);
    mkdir.sync(absDir);

    log.configure({ console: false, file: path.join(dir, 'out.log') });
    log.print('hello');
    log.configure({ file: false });

    expect(fs.readFileSync(path.join(absDir, 'out.log'), 'utf8')).toMatch(
      'hello'
    );

    del.sync(absDir);
  });

  it('should allow printing to file as json', () => {
    const dir = `test/tmp-${(Math.random() * 10000).toFixed(0)}`;
    const absDir = path.resolve(dir);
    mkdir.sync(absDir);

    log.configure({
      console: false,
      file: path.join(dir, 'out.log'),
      json: true,
    });
    log.print('hello');
    log.configure({ file: false });

    expect(fs.readFileSync(path.join(absDir, 'out.log'), 'utf8')).toMatch(
      /\{"timestamp":".*","message":"hello"\}/
    );

    del.sync(absDir);
  });

  it('should allow to use custom print listener', () => {
    const listener = jest.fn();
    log.configure({ console: false, file: undefined, listener });
    log.print('hello');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith('print', 'hello');
  });
});
