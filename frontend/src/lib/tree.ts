// Pure helpers for manipulating the Postman-style items tree (folders +
// requests). Everything here is side-effect free and returns a NEW tree, so
// callers can persist the result via `updateProjectItems` without worrying
// about mutating React state in place.
import { CollectionItem } from '../types'

/** Where a dragged node is dropped relative to the target node. */
export type DropPosition = 'before' | 'after' | 'inside'

/** Deep clone so mutations never touch the live React state. */
export function cloneItems(items: CollectionItem[]): CollectionItem[] {
  return JSON.parse(JSON.stringify(items ?? []))
}

/** True if `nodeId` is `ancestor` itself or lives anywhere inside it. Used to
 *  block dropping a folder into its own subtree. */
export function isSelfOrDescendant(node: CollectionItem, nodeId: string): boolean {
  if (node.id === nodeId) return true
  if (node.type === 'folder') {
    return (node.items || []).some((child) => isSelfOrDescendant(child, nodeId))
  }
  return false
}

/** Insert `node` as the last child of the folder with `folderId`.
 *  Returns a new tree (falls back to appending at root if the folder vanished). */
export function insertIntoFolder(
  items: CollectionItem[],
  folderId: string,
  node: CollectionItem,
): CollectionItem[] {
  const tree = cloneItems(items)
  const placed = (function walk(nodes: CollectionItem[]): boolean {
    for (const n of nodes) {
      if (n.type === 'folder' && n.id === folderId) {
        n.items = [...(n.items || []), node]
        return true
      }
      if (n.type === 'folder' && walk(n.items || [])) return true
    }
    return false
  })(tree)
  if (!placed) tree.push(node)
  return tree
}

/** Remove the node with `id` from the tree (in place on the passed array),
 *  returning the detached node or null. */
function detach(nodes: CollectionItem[], id: string): CollectionItem | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (n.id === id) {
      nodes.splice(i, 1)
      return n
    }
    if (n.type === 'folder') {
      const found = detach(n.items || [], id)
      if (found) return found
    }
  }
  return null
}

/** Move `dragId` relative to `targetId`:
 *   - 'inside'         → append as last child of the target folder
 *   - 'before'/'after' → place in the target's container next to it (reorder or
 *                        cross-container move)
 *  Returns a NEW tree, or the original items unchanged if the move is invalid
 *  (dropping onto itself, or a folder into its own descendant). */
export function moveNode(
  items: CollectionItem[],
  dragId: string,
  targetId: string,
  pos: DropPosition,
): CollectionItem[] {
  if (dragId === targetId) return items

  const tree = cloneItems(items)
  const dragged = detach(tree, dragId)
  if (!dragged) return items

  // A folder can't be dropped into itself or its own subtree.
  if (dragged.type === 'folder' && isSelfOrDescendant(dragged, targetId)) return items

  const inserted = (function place(nodes: CollectionItem[]): boolean {
    if (pos === 'inside') {
      for (const n of nodes) {
        if (n.id === targetId && n.type === 'folder') {
          n.items = [...(n.items || []), dragged]
          return true
        }
        if (n.type === 'folder' && place(n.items || [])) return true
      }
      return false
    }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (n.id === targetId) {
        nodes.splice(pos === 'after' ? i + 1 : i, 0, dragged)
        return true
      }
      if (n.type === 'folder' && place(n.items || [])) return true
    }
    return false
  })(tree)

  return inserted ? tree : items
}

/** Append a node at the end of the root list (used for the "move to root" zone). */
export function appendToRoot(items: CollectionItem[], dragId: string): CollectionItem[] {
  const tree = cloneItems(items)
  const dragged = detach(tree, dragId)
  if (!dragged) return items
  tree.push(dragged)
  return tree
}

function freshId(): string {
  const c = globalThis.crypto as Crypto | undefined
  return c?.randomUUID ? c.randomUUID() : 'id-' + Math.random().toString(36).slice(2)
}

/** Deep clone a node giving it — and every descendant — brand-new ids, so a
 *  duplicate can't collide with the original. */
function cloneWithFreshIds(node: CollectionItem): CollectionItem {
  if (node.type === 'folder') {
    return { ...node, id: freshId(), items: (node.items || []).map(cloneWithFreshIds) }
  }
  return { ...node, id: freshId() }
}

/** Rename the folder/request with `id`. Returns a new tree. */
export function renameItem(items: CollectionItem[], id: string, name: string): CollectionItem[] {
  const tree = cloneItems(items)
  ;(function walk(nodes: CollectionItem[]): boolean {
    for (const n of nodes) {
      if (n.id === id) { n.name = name; return true }
      if (n.type === 'folder' && walk(n.items || [])) return true
    }
    return false
  })(tree)
  return tree
}

/** Remove the folder/request with `id` (and its contents). Returns a new tree. */
export function removeItem(items: CollectionItem[], id: string): CollectionItem[] {
  const tree = cloneItems(items)
  detach(tree, id)
  return tree
}

/** Duplicate the folder with `folderId` (deep copy + fresh ids) right after the
 *  original. Returns a new tree, or the original if the folder wasn't found. */
export function duplicateFolder(items: CollectionItem[], folderId: string): CollectionItem[] {
  const tree = cloneItems(items)
  const done = (function walk(nodes: CollectionItem[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (n.id === folderId && n.type === 'folder') {
        const copy = cloneWithFreshIds({ ...n, name: `${n.name} (copy)` })
        nodes.splice(i + 1, 0, copy)
        return true
      }
      if (n.type === 'folder' && walk(n.items || [])) return true
    }
    return false
  })(tree)
  return done ? tree : items
}
