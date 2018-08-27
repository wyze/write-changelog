import { readFileSync, writeFileSync } from 'fs'
import execa from 'execa'
import ghGot from 'gh-got'
import readPkg from 'read-pkg'

/**
 * Runs `changelog-maker` and grabs the output.
 *
 * TODO: Support override with `npm changelog` script.
 */
const getChanges = async (url: string): Promise<string[]> => {
  const [user, repo] = url.split('/').slice(3)
  const args = ['--filter-release', '--', user, repo.replace('.git', '')]
  const stdout = await execa.stdout('changelog-maker', args)
  const changes = stdout
    .trim()
    .split(' \n')
    // This will filter out apm (Atom Packages) releases as well
    .filter(
      (change: string) => !/\sPrepare v?\d\.\d\.\d.* release\s/.test(change)
    )

  return changes
}

const addHeaderToChanges = ({
  changes,
  url,
  version,
}: ChangesUrlVersion): string[] => {
  const date = new Date()
    .toJSON()
    .split('T')
    .shift()
  const tag = `v${version}`
  const repo = url.replace(/\.?git(?!hub)\+?/g, '')
  const header = `### [${tag}](${repo}/releases/tag/${tag}) (${date})`

  return [header, '', ...changes]
}

/**
 * Update changelog with latest changes.
 */
const updateChangelog = (formatted: string[]) => {
  const file = 'changelog.md'
  const changelog = readFileSync(file)
    .toString()
    .split('\n')

  writeFileSync(
    file,
    [...changelog.slice(0, 2), ...formatted, ...changelog.slice(1)].join('\n')
  )
}

/**
 * Update readme with latest changes.
 */
const updateReadme = (formatted: string[]) => {
  const file = 'readme.md'
  const readme = readFileSync(file)
    .toString()
    .split('\n')
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

const createGithubRelease = async ({
  changes,
  url,
  version,
}: ChangesUrlVersion) => {
  const ownerRepo = url
    .split('/')
    .slice(-2)
    .map((slug: string) => slug.replace('.git', ''))
    .join('/')

  await ghGot(`repos/${ownerRepo}/releases`, {
    body: {
      body: changes.join('\n'),
      tag_name: `v${version}`,
    },
  })
}

// Run it
export default async () => {
  const {
    repository: { url },
    version,
  } = await readPkg()

  const changes = await getChanges(url)
  const data = { changes, url, version }
  const changesWithHeader = addHeaderToChanges(data)

  await updateChangelog(changesWithHeader)
  await updateReadme(changesWithHeader)

  // Stage files in git
  await execa('git', ['add', '--all'])

  // If GitHub token is present, create a GitHub release
  if (typeof process.env.GITHUB_TOKEN === 'string') {
    await createGithubRelease(data)
  }
}
