export interface Endpoint {
  id: string
  name: string
  url: string
  method: string
  headers: Record<string, string>
  payload: Record<string, any>
  payload_type: string
  extractors?: Record<string, string>
}

export interface TestConfig {
  base_url: string
  variables: Record<string, string>
  tests: Endpoint[]
}

export interface RunStatus {
  status: string
  stats: {
    attempts: number
    success: number
    rate_limited: number
    errors: number
  }
  logs: string[]
}