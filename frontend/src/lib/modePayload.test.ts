import { describe, expect, it } from 'vitest'
import { buildRunPayload } from './modePayload'

describe('buildRunPayload', () => {
  it('converts load delay milliseconds into the backend contract', () => {
    expect(buildRunPayload('one', 'load', {
      concurrency: 4, max_requests: 20, delay_ms: 250, no_delay: false,
    })).toEqual({
      test_id: 'one', mode: 'load', concurrency: 4, max_requests: 20,
      delay: 0.25, use_min_delay: false,
    })
  })

  it('normalizes prefixed spike fields', () => {
    expect(buildRunPayload('two', 'spike', {
      spike_baseline_workers: 2,
      spike_peak_workers: 8,
      spike_baseline_requests: 10,
      spike_peak_requests: 30,
      spike_recovery_requests: 10,
      delay_ms: 100,
    })).toEqual({
      test_id: 'two', mode: 'spike', baseline_workers: 2, peak_workers: 8,
      baseline_requests: 10, peak_requests: 30, recovery_requests: 10, delay: 0.1,
    })
  })

  it('normalizes soak and benchmark fields', () => {
    expect(buildRunPayload('three', 'soak', {
      soak_duration_s: 30, soak_rps: 2, soak_concurrency: 3,
    })).toEqual({ test_id: 'three', mode: 'soak', duration_s: 30, rps: 2, concurrency: 3 })
    expect(buildRunPayload('four', 'benchmark', {
      benchmark_requests: 50, benchmark_warmup: 5,
    })).toEqual({ test_id: 'four', mode: 'benchmark', n_samples: 50, warmup: 5 })
  })
})
