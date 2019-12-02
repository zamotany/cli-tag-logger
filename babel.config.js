module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '10' }, modules: false }],
    '@babel/preset-typescript',
  ],
  env: {
    cjs: {
      presets: [
        ['@babel/preset-env', { targets: { node: '10' }, modules: 'cjs' }],
      ],
    },
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: 'cjs' }],
      ],
    },
  },
};
