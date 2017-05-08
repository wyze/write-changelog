jest.mock('read-pkg')
jest.mock('execa')
jest.mock('fs')

const date = new Date(2017, 4, 1)

global.Date = jest.fn(() => date)

describe('write-changelog', () => {
  it('works', async () => {
    const fs = require('fs')

    await require('../').default

    expect(fs.writeFileSync.mock.calls).toMatchSnapshot()
  })
})
