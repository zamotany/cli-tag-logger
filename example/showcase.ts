import {
  InteractiveWriter,
  composeWriters,
  info,
  debug,
  success,
  warn,
  error,
  createTag,
  styles,
} from '..';
import { terminal } from 'terminal-kit';

const delay = (timeout: number) =>
  new Promise(resolve => setTimeout(resolve, timeout));

(async () => {
  const { updateSpinner, stopSpinner, startSpinner, print } = composeWriters(
    new InteractiveWriter()
  );

  const awesome = createTag(() => styles.blue`${styles.bold`awesome `}`);
  const custom = createTag(() => styles.magenta`custom `);
  const doIt = createTag(() => styles.red`just do it `);

  terminal.clear();
  await delay(5000);
  print(
    awesome`${styles.bold`cli-tag-logger`} will help you write beautiful CLI apps`
  );
  await delay(3000);
  print(awesome`While proving nice API for improved Developer Experience`);
  await delay(3000);
  print(info`It uses tagged literal templates for styling and interpolation`);
  await delay(3000);
  print(debug`Hello`);
  print(info`Hola`);
  print(success`Cześć`);
  print(warn`Guten Tag`);
  print(error`Bonjour`);
  print(custom`Ciao`);
  await delay(3000);

  print(info`You can log not only strings but also:`);
  await delay(2000);
  print(info`functions ${function hello() {}}`);
  print(info`objects ${{ message: 'hello', say() {} }}`);
  print(info`classes ${class A {}}`);
  print(info`regexes ${/hello/gm}`);
  print(info`...and others`);
  await delay(4000);

  print(info`${styles.bold`cli-tag-logger`} supports printing to console`);
  await delay(2000);
  print(info`As well as to a file`);
  await delay(1000);
  print(success`Even at the same time`);
  await delay(3000);

  print(debug`And now`);
  await delay(1000);
  print(awesome`It gives you intuitive API for spinners`);
  startSpinner(styles.green`I'm alive!`);
  await delay(3000);
  print(awesome`While printing other messages`);
  await delay(2000);
  print(info`At the same time`);
  await delay(2000);
  print(info`You can update the message`);
  await delay(1000);
  updateSpinner(awesome`This is nice`);
  await delay(3000);
  print(info`You can stop the spinner and replace it with message`);
  await delay(2000);
  stopSpinner(success`Finished`);
  await delay(2000);
  print(info`You can start another spinner`);
  startSpinner(debug`Another spinner`, { type: 'bouncingBall' });
  await delay(4000);

  stopSpinner(doIt`Go ahead and check it out!`);
  print(`---> https://github.com/zamotany/cli-tag-logger`);
  await delay(8000);
})();
