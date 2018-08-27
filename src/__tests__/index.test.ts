jest.mock('read-pkg')
jest.mock('execa')
jest.mock('fs')

const date = new Date(2017, 4, 1)

global.Date = jest.fn(() => date)

describe('write-changelog', () => {
  it('works', async () => {
    const fs = require('fs')

    await require('..').default()

    expect(fs.writeFileSync.mock.calls).toMatchSnapshot()
  })

  it('creates a release when GITHUB_TOKEN is present', async () => {
    process.env.GITHUB_TOKEN = 'abcdef1234567890'

    const ghGot = require('gh-got')

    await require('..').default()

    expect(ghGot).toHaveBeenCalledWith('repos/user/repo/releases', {
      body: {
        body: '* [[`c0489425d5`](https://github.com/user/repo/commit/c0489425d5)] - Initial Commit (Neil Kistner)',
        tag_name: 'v1.0.0',
      },
    })
  })
})
