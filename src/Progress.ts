import { ComposableValues, compose } from './utils';
import restoreCursor from 'restore-cursor';
import { terminal } from 'terminal-kit';

type PrintFn = (...values: ComposableValues) => void;

type ProgressConfig = {
  renderBottom: (print: PrintFn, info: { delta: number }) => void;
};

class Progress {
  lastTickTimestamp: number = Date.now();
  topY: number = 0;
  bottomHeight: number = 0;
  renderBottom: ProgressConfig['renderBottom'];

  constructor(config: ProgressConfig) {
    this.renderBottom = config.renderBottom;
    terminal.getCursorLocation((error, x, y) => {
      if (error || x === undefined || y === undefined) {
        throw new Error('Cannot get cursor position');
      }
      this.topY = y;
      terminal.hideCursor(true);
      this.tick();
    });
  }

  tick = () => {
    debugger;
    const now = Date.now();
    const delta = Math.abs(now - this.lastTickTimestamp);
    this.lastTickTimestamp = now;
    const lines: string[] = [];
    this.renderBottom(
      (...values) => {
        lines.push(...compose(...values).split('\n'));
      },
      { delta }
    );

    this.bottomHeight = lines.length;

    // Lines of available area
    const fillLength = Math.max(0, terminal.height - this.topY);

    terminal.moveTo(0, this.topY);
    terminal.eraseDisplayBelow();
    terminal('\n'.repeat(fillLength));
    // If there's enough room for bottom part, the cursor needs to be moved up.
    // Otherwise, we need to update topY since rendering bottom section will push new lines.
    if (fillLength + 1 >= this.bottomHeight) {
      terminal.moveTo(0, terminal.height - this.bottomHeight + 1);
    } else {
      this.topY -= this.bottomHeight - 1;
    }
    terminal(lines.join('\n'));
  };

  printAbove: PrintFn = (...values) => {
    debugger;
    const lines = compose(...values).split('\n');
    terminal.moveTo(0, this.topY);
    terminal.eraseDisplayBelow();
    terminal(lines.join('\n'));
    this.topY += lines.length;
    this.tick();
  };
}

export function makeProgress(config: ProgressConfig): Progress {
  restoreCursor();
  return new Progress(config);
}

const { tick, printAbove } = makeProgress({
  renderBottom: (print, { delta }) => {
    print('hello');
    print('world', delta);
    // if (Math.random() > 0.5) {
    //   print('random');
    // }
  },
});

setInterval(() => {
  // tick();
}, 1000);

setInterval(() => {
  printAbove('print above', Date.now());
}, 1000);
