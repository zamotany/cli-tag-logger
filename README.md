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

By default all logs are written to `process.stdout`. You can override this behavior with `configure` function.

All of the tags returns a strings. You can use provided `print` function, but you can also use `console.log` or anything you want.

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

### Writers

`Writer` class allows to customize where the messages are written. There are 3 predefined writers:

- `ConsoleWriter` - writes messages to `process.stdout` (this writer is used by exported `print` function)
- `FileWriter(filename: string, json: boolean = false)` - writes messages to a file
- `ComposeWriter` - composes multiple writers together
  
and a single abstract class `Writer`.

To write messages to both `process.stdout` and file you would need to compose both `ConsoleWriter` and `FileWriter`:

```ts
import { success, ConsoleWriter, FileWriter, ComposeWriter } from 'cli-tag-logger';
import path from 'path';

const { print } = new ComposeWriter(
  new ConsoleWriter(),
  new FileWriter('output.log')
);

print(success`This will be printed in your terminal as well as in ${path.resolve('output.log')}`);
```

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
import { success, Writer, FileWriter, ComposeWriter  } from 'cli-tag-logger';

class StderrWriter extends Writer {
  onPrint(message: string) {
    process.stderr.write(message + '\n');
  }
}

const { print } = new ComposeWriter(
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
