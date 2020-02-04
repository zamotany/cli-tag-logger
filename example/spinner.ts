import {
  InteractiveWriter,
  FileWriter,
  info,
  composeWriters,
  success,
} from '..';

const delay = (timeout: number) =>
  new Promise(resolve => setTimeout(resolve, timeout));

(async () => {
  const { updateSpinner, stopSpinner, startSpinner, print } = composeWriters(
    new InteractiveWriter(),
    new FileWriter('logs/output.log')
  );

  print(info`hello world`);
  startSpinner(info`This spinner is spinnin'`, { type: 'bouncingBar' });

  let interval = setInterval(() => {
    print(info`new message ${Date.now()}`);
  }, 1000);

  await delay(3000);
  updateSpinner(info`This will be a very long lin${'e'.repeat(300)}`);

  await delay(6000);
  stopSpinner(success`Finished`);
  clearInterval(interval);

  await delay(500);
  startSpinner(success`Another spinner`);

  interval = setInterval(() => {
    print(info`new message ${Date.now()}`);
  }, 1000);

  await delay(5000);
  stopSpinner();
  clearInterval(interval);
})();
