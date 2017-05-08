const execa = jest.genMockFromModule('execa')

execa.stdout = jest.fn(() => new Promise(resolve => resolve(
  '* [[`c0489425d5`](https://github.com/user/repo/commit/c0489425d5)] - Initial Commit (Neil Kistner)'
)))

module.exports = execa
