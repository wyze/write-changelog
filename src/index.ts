import { readFileSync, writeFileSync } from 'fs'
import * as execa from 'execa'
import * as readPkg from 'read-pkg'

/**
 * Read package.json and return git url and version.
 */
const getVersionAndUrl = ({ repository: { url }, version }: Package): UrlVersion =>
  ({ url, version })

/**
 * Runs `changelog-maker` and grabs the output.
 *
 * TODO: Support override with `npm changelog` script.
 */
const getChanges = async ({ url, version }: UrlVersion): Promise<ChangesUrlVersion> => {
  const [ user, repo ] = url.split('/').slice(3)
  const args = [ '--filter-release', '--', user, repo.replace('.git', '') ]
  const stdout = await execa.stdout('changelog-maker', args)
  const changes = stdout.trim().split(' \n')

  return { changes, url, version }
}

/**
 * Update changelog with latest changes.
 */
const updateChangelog = ({ changes, url, version }: ChangesUrlVersion): string[] => {
  const file = 'changelog.md'
  const changelog = readFileSync(file).toString().split('\n')
  const date = new Date().toJSON().split('T').shift()
  const tag = `v${version}`
  const repo = url.replace(/\.?git(?!hub)\+?/g, '')
  const header = `### [${tag}](${repo}/releases/tag/${tag}) (${date})`
  const formatted = [ header, '', ...changes ]

  writeFileSync(
    file,
    [
      ...changelog.slice(0, 2),
      ...formatted,
      ...changelog.slice(1),
    ].join('\n')
  )

  return formatted
}

/**
 * Update readme with latest changes.
 */
const updateReadme = ( formatted: string[] ) => {
  const file = 'readme.md'
  const readme = readFileSync(file).toString().split('\n')
  const start = '> [Full Change Log](changelog.md)'
  const end = '## License'

  writeFileSync(
    file,
    [
      ...readme.slice(0, readme.indexOf(start) + 2),
      ...formatted,
      ...readme.slice(readme.indexOf(end) - 1),
    ].join('\n')
  )
}

/**
 * Stage the files in git.
 */
const runGitAdd = async () => {
  await execa('git', [ 'add', '--all' ])
}

export default readPkg()
  .then(getVersionAndUrl)
  .then(getChanges)
  .then(updateChangelog)
  .then(updateReadme)
  .then(runGitAdd)
