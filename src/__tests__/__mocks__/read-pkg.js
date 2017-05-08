module.exports = jest.fn(
  () => new Promise(
    resolve => resolve({
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'git+https://github.com/user/repo.git',
      },
    })
  )
)
