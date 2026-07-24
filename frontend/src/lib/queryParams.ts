export interface QueryParam {
  key: string
  value: string
}

function decodePart(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function encodePart(value: string): string {
  // Keep Beacon template tokens readable and executable in the URL while
  // encoding ordinary reserved characters.
  return encodeURIComponent(value)
    .replace(/%7B%7B/gi, '{{')
    .replace(/%7D%7D/gi, '}}')
}

export function parseQueryParams(url: string): QueryParam[] {
  const queryStart = url.indexOf('?')
  if (queryStart < 0) return []
  const hashStart = url.indexOf('#', queryStart)
  const query = url.slice(queryStart + 1, hashStart < 0 ? undefined : hashStart)
  if (!query) return []

  return query.split('&').map((part) => {
    const equals = part.indexOf('=')
    if (equals < 0) return { key: decodePart(part), value: '' }
    return {
      key: decodePart(part.slice(0, equals)),
      value: decodePart(part.slice(equals + 1)),
    }
  })
}

export function buildUrlWithQuery(url: string, params: QueryParam[]): string {
  const queryStart = url.indexOf('?')
  const hashStart = url.indexOf('#')
  const pathEnd = queryStart >= 0 ? queryStart : hashStart >= 0 ? hashStart : url.length
  const path = url.slice(0, pathEnd)
  const hash = hashStart >= 0 ? url.slice(hashStart) : ''
  const active = params.filter(({ key, value }) => key !== '' || value !== '')
  if (!active.length) return `${path}${hash}`
  const query = active.map(({ key, value }) => `${encodePart(key)}=${encodePart(value)}`).join('&')
  return `${path}?${query}${hash}`
}
