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

  it('should allow to compose messages', () => {});

  it('should print message', () => {});

  it('should allow printing to file', () => {});

  it('should allow printing to file as json', () => {});
});
