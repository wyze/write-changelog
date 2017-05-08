const fs = jest.genMockFromModule('fs')

fs.readFileSync = jest.fn(() => '')

module.exports = fs
