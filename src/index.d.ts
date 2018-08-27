declare module 'execa'
declare module 'gh-got'
declare module 'read-pkg'

declare type Package = {
  name: string
  repository: {
    url: string
  }
  version: string
}

declare type ChangesUrlVersion = {
  changes: string[]
  url: string
  version: string
}

declare type UrlVersion = {
  url: string
  version: string
}
