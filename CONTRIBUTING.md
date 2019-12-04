# Contributing

In order to contribute to the project first you need to fork the repo, clone it and install dependencies:

```bash
git clone git@github.com:<your_username>/cli-tag-logger.git && \
yarn install
```

Now, you're ready to go.

---

Source code is located inside `src/` folder and tests for it are in `tests/`.

You can use:

- `yarn watch` to build and watch for the changes in source files
- `yarn test` to run tests with Jest
- `yarn lint` to lint the code with ESLint
- `yarn typecheck` to run TypeScript type checking

After you make your changes, you should add tests and open a PR.


## Publishing

To publish new version of the packages run `./publish/sh` script.
