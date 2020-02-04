# `cli-tag-logger`

[![GitHub Workflow Status][build-badge]][build] [![Version][version]][package] [![MIT License][license-badge]][license]

[![PRs Welcome][prs-welcome-badge]][prs-welcome]
[![Code of Conduct][coc-badge]][coc]

Log messages in CLI apps using tagged template literals.

## Installation & usage

Install the package:
```bash
yarn add cli-tag-logger
```

Then:
```js
import * as log from 'cli-tag-logger';

log.print(log.info`Hello world`);
log.print(
  log.debug`Current env: ${{
    SHELL: process.env.SHELL,
    TERM: process.env.TERM,
  }}`
);

log.print(
  log.compose(
    log.styles.magenta`Custom message`,
    ' '.repeat(4),
    { my: 'object' },
    class A {},
    /regex/
  )
);
```

Result:

![screenshot](https://raw.githubusercontent.com/zamotany/cli-tag-logger/master/screenshot.png)


## Examples

You can start examples from `examples/` directory running:

```bash
yarn example <example_name>
```

For instance:

```
yarn example spinners
```

## API

### Logging

Out of the box `cli-tag-logger` exports the following logging tags:

- `debug`
- `info`
- `success`
- `warn`
- `error`

Additionally use can use:

- `trace` - similar to `console.trace`
- `inspect` - similar to `util.inspect` with some better defaults

All of the tags return strings. You can use provided [`print`](#print) function, but you can also use `console.log`, [custom writer](#writers) or anything you want. 

If you want to have custom tag, you can use `createTag` function, which accepts `prefix: string` as a first argument and returns a tag function:

```js
import { createTag, styles, print } from 'cli-tag-logger';

const custom = createTag(styles.cyan`custom `);

print(custom`Hello World`);
```

![screenshot](https://raw.githubusercontent.com/zamotany/cli-tag-logger/master/custom.png)

### Styling

`cli-tag-logger` uses [colorette](https://www.npmjs.com/package/colorette) under the hood, and exposes all styling functions like `green`, `bold`, `bgBlue`, `italic` as tags functions with inspect and nesting support:

```js
import { styles } from 'cli-tag-logger';

console.log(styles.blue`${styles.bold`Hello`}`);
console.log(styles.green(styles.underline`World`));
```

![screenshot](https://raw.githubusercontent.com/zamotany/cli-tag-logger/master/styles.png)

### `print`

`print` function is used to print values to `process.stdout`. You can pass multiple values:

```js
import { print, debug } from 'cli-tag-logger';

print(debug`Hello`, { a: 1, b: 2 });
```

`print` function should be used only if you want to write messages to `process.stdout`. If you wan to customize this behavior use predefined writes or create your own. 

### Filtering messages

Some writers like `ConsoleWriter` support filter messages. You can filter messages for specific tag or exclude unwanted messages.

Writers which support filtering accept an optional `filter` property in their constructor:

```ts
import { info, debug, success, ConsoleWriter } from 'cli-tag-logger';

const { print } = new ConsoleWriter({
  filter: {
    exclude: 'debug',
  },
});

print('will be logged');
print(info`will be logged as well`);
print(debug`won't be logged`);
```

`filter` property accepts these properties:

- `only?: LevelTag | LevelTag[]` - if the message matches the value at least a single value (if array is passed), the message will pass filtering and be logged (in case of `ConsoleWriter`)
- `exclude?: LevelTag | LevelTag[]` - if the message matches the value at least a single value (if array is passed), the message will not pass filtering and won't be logged (in case of `ConsoleWriter`)

If you combine both `only` and `exclude`, the message must satisfy both to pass filtering:

```ts
import { info, debug, success, ConsoleWriter } from 'cli-tag-logger';

const { print } = new ConsoleWriter({
  filter: {
    only: ['debug', 'info', 'success'],
    exclude: 'debug',
  },
});

print(info`will be logged`);
print(success`will be logged as well`);
print(debug`won't be logged`);
```

`LevelTag` can be `debug`, `info`, `success`, `warn`, `error` or RegExp. For custom tags (created using `createTag`) use RegExp:

```ts
import { createTag ConsoleWriter } from 'cli-tag-logger';

const custom = createTag('custom ');

const { print } = new ConsoleWriter({
  filter: {
    only: /^custom/,
  },
});

print(custom`will be logged`);
print(`won't be logged`);
```

### Writers

`Writer` class allows to customize where the messages are written. There are 3 predefined writers:

- `ConsoleWriter({ filter }?: { filer?: FilterConfig })` - writes messages to `process.stdout` (this writer is used by exported `print` function); supports filtering
- `FileWriter(filename: string, { filter, json }?: { filer?: FilterConfig; json?: boolean })` - writes messages to a file; supports filtering
- `InteractiveWriter` - writes messages to `process.stdout` and allows to draw a spinner at the bottom:
  - `startSpinner(message: string, { type, interval }?: SpinnerOptions): void` - starts a spinner with a given `message` next to it; supports all spinners from [cli-spinners](https://github.com/sindresorhus/cli-spinners)
  - `updateSpinner(...values: ComposableValues): void` - updates a message printed next to the spinner
  - `stopSpinner(...values: ComposableValues): void` - stops a running spinner and prints given `values` in it's place
  
and a single abstract class `Writer`.

#### Composing writers

You can compose multiple writes together using `composeWriters` function.


To write messages to both `process.stdout` and file you would need to compose both `ConsoleWriter` and `FileWriter`:

```ts
import { success, ConsoleWriter, FileWriter, composeWriters } from 'cli-tag-logger';
import path from 'path';

const { print } = composeWriters(
  new ConsoleWriter(),
  new FileWriter('output.log')
);

print(success`This will be printed in your terminal as well as in ${path.resolve('output.log')}`);
```

`composeWriters` function accepts unlimited amount of writers, but the first writer is called a _main_ writer. All of the functions (except for `print` and `onPrint`) from the _main_ writer will be exposed inside returned object.


Take `InteractiveWriter` for example - it has additional 3 methods: `startSpinner`, `updateSpinner` and `stopSpinner`. If `InteractiveWriter` is the _main_ writer, all of those 3 functions will be available for you:

```ts
import { info, InteractiveWriter, FileWriter, composeWriters } from 'cli-tag-logger';

const { print, startSpinner, updateSpinner, stopSpinner } = composeWriters(
  new InteractiveWriter(),
  new FileWriter()
);

print(info`Hello`)
startSpinner(info`I'm spinning`);

setTimeout(() => {
  updateSpinner(info`I'm getting dizzy...`);
}, 1000);

setTimeout(() => {
  stopSpinner(`Done`);
}, 2000);
```

However if you change the order and `FileWriter` will come first, only `print` function will be exposed, since this is the only function that `FileWriter` provides:

```ts
import { info, InteractiveWriter, FileWriter, composeWriters } from 'cli-tag-logger';

const { print } = composeWriters(
  new FileWriter(),
  new InteractiveWriter()
);

print(info`I'm the only function available`);
```

#### Creating custom writer

If you want to create your own writer, you need to extend abstract `Writer` class and implement `onPrint` function:

```ts
import { success, Writer } from 'cli-tag-logger';

class StderrWriter extends Writer {
  onPrint(message: string) {
    process.stderr.write(message + '\n');
  }
}

const { print } = new StderrWriter();

print(success`This will be printed to process.stderr`);
```

You can compose your custom writer with predefined ones:

```ts
import { success, Writer, FileWriter, composeWriters  } from 'cli-tag-logger';

class StderrWriter extends Writer {
  onPrint(message: string) {
    process.stderr.write(message + '\n');
  }
}

const { print } = composeWriters(
  new StderrWriter(),
  new FileWriter('output.log')
);

print(success`This will be printed to process.stderr and to a file`);
```

[version]: https://img.shields.io/npm/v/cli-tag-logger.svg?style=flat-square
[package]: https://www.npmjs.com/package/cli-tag-logger
[build]: https://github.com/zamotany/cli-tag-logger/actions
[build-badge]: https://img.shields.io/github/workflow/status/zamotany/cli-tag-logger/Node%20CI?style=flat-square
[license-badge]: https://img.shields.io/npm/l/cli-tag-logger.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
[prs-welcome-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs-welcome]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/zamotany/cli-tag-logger/blob/master/CODE_OF_CONDUCT.md
