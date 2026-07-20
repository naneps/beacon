import { useCallback, useState } from 'react'
import { AlertTriangle, Play, Trash2 } from 'lucide-react'

import { Button } from './button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'

export interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'action'
  detail?: string
}

interface PendingConfirmation extends ConfirmOptions {
  resolve: (confirmed: boolean) => void
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirmation | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => (
    new Promise<boolean>((resolve) => setPending({ ...options, resolve }))
  ), [])

  const settle = useCallback((confirmed: boolean) => {
    setPending((current) => {
      current?.resolve(confirmed)
      return null
    })
  }, [])

  const tone = pending?.tone || 'danger'
  const Icon = tone === 'danger' ? Trash2 : Play

  const confirmationDialog = (
    <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) settle(false) }}>
      <AlertDialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="flex gap-3 p-5 pr-12">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tone === 'danger'
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <AlertDialogHeader className="min-w-0 text-left">
            <AlertDialogTitle className="text-base">{pending?.title || 'Confirm action'}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-5">
              {pending?.description || 'Are you sure you want to continue?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {pending?.detail && (
          <div className="mx-5 mb-4 flex gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{pending.detail}</span>
          </div>
        )}

        <AlertDialogFooter className="border-t border-border bg-muted/25 px-5 py-3">
          <AlertDialogCancel asChild>
            <Button variant="ghost" size="sm" onClick={() => settle(false)}>
              {pending?.cancelLabel || 'Cancel'}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={tone === 'danger' ? 'destructive' : 'default'} size="sm" onClick={() => settle(true)}>
              {pending?.confirmLabel || 'Confirm'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, confirmationDialog }
}
