import { describe, expect, it } from 'vitest'
import type { CollectionItem } from '../types'
import { moveNode } from './tree'

const request = (id: string): CollectionItem => ({
  id, name: id, type: 'request', url: `/${id}`, method: 'GET', headers: {}, payload: {}, payload_type: 'json',
})

describe('collection reorder', () => {
  it('reorders sibling folders and requests', () => {
    const items: CollectionItem[] = [
      { id: 'folder', name: 'Folder', type: 'folder', items: [] },
      request('one'),
      request('two'),
    ]
    expect(moveNode(items, 'two', 'one', 'before').map((item) => item.id)).toEqual(['folder', 'two', 'one'])
  })

  it('moves a request into a folder', () => {
    const items: CollectionItem[] = [
      { id: 'folder', name: 'Folder', type: 'folder', items: [] },
      request('one'),
    ]
    const moved = moveNode(items, 'one', 'folder', 'inside')
    expect(moved).toHaveLength(1)
    expect(moved[0].type === 'folder' ? moved[0].items.map((item) => item.id) : []).toEqual(['one'])
  })
})
