import { describe, expect, it } from 'vitest'
import { buildUrlWithQuery, parseQueryParams } from './queryParams'

describe('query parameter URL sync', () => {
  it('parses pasted absolute and relative URLs', () => {
    expect(parseQueryParams('https://api.test/users?page=1&tag=a&tag=b')).toEqual([
      { key: 'page', value: '1' },
      { key: 'tag', value: 'a' },
      { key: 'tag', value: 'b' },
    ])
    expect(parseQueryParams('/users?q=hello%20world')).toEqual([{ key: 'q', value: 'hello world' }])
  })

  it('rebuilds the URL while preserving fragments and templates', () => {
    expect(buildUrlWithQuery('/users?old=1#results', [
      { key: 'page', value: '{{page}}' },
      { key: 'filter', value: 'active users' },
    ])).toBe('/users?page={{page}}&filter=active%20users#results')
  })

  it('removes the question mark when every row is removed', () => {
    expect(buildUrlWithQuery('/users?page=1#results', [])).toBe('/users#results')
  })
})
