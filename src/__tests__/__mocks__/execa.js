const execa = jest.genMockFromModule('execa')

execa.stdout = jest.fn(() => new Promise(resolve => resolve(
  '* [[`bd0949281f`](https://github.com/user/repo/commit/bd0949281f)] - Prepare 1.0.0 release (Neil Kistner) \n' +
  '* [[`c0489425d5`](https://github.com/user/repo/commit/c0489425d5)] - Initial Commit (Neil Kistner)'
)))

module.exports = execa
