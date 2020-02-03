import { createTester } from '../filter';
import { debug, info, success } from '../tags';

describe('filter', () => {
  it('should filter messages matching only', () => {
    const tester = createTester({
      only: ['success', /test/],
    });

    expect(tester(success`hello`)).toBe(true);
    expect(tester(info`hello`)).toBe(false);
    expect(tester(debug`hello`)).toBe(false);
    expect(tester('testing')).toBe(true);
  });

  it('should filter messages not matching exclude', () => {
    const tester = createTester({
      exclude: ['debug', 'info', /test/],
    });

    expect(tester(success`hello`)).toBe(true);
    expect(tester(info`hello`)).toBe(false);
    expect(tester(debug`hello`)).toBe(false);
    expect(tester('testing')).toBe(false);
  });

  it('should filter messages matching only and not matching exclude', () => {
    const tester = createTester({
      only: ['debug', 'info'],
      exclude: ['debug'],
    });

    expect(tester(success`hello`)).toBe(false);
    expect(tester(info`hello`)).toBe(true);
    expect(tester(debug`hello`)).toBe(false);
  });

  it('should filter messages using custom tester', () => {
    const tester = createTester(msg => msg.startsWith('success'));

    expect(tester(success`hello`)).toBe(true);
    expect(tester(info`hello`)).toBe(false);
    expect(tester(debug`hello`)).toBe(false);
  });
});
