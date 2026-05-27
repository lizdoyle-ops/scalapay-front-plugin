import { useState, useEffect } from 'react'

export interface FrontContextState {
  contactEmail: string | null
  conversationId: string | null
  hasConversation: boolean
  /** True while the initial loading/skeleton is showing */
  loading: boolean
  /** True when we're outside Front (no context update after 1.5s) */
  isDevMode: boolean
}

export function useFrontContext(): FrontContextState {
  const [state, setState] = useState<FrontContextState>({
    contactEmail: null,
    conversationId: null,
    hasConversation: false,
    loading: true,
    isDevMode: false,
  })

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    let devModeTimer: ReturnType<typeof setTimeout>
    let frontFired = false

    // If Front SDK hasn't called back in 1.5s, we're running outside Front
    devModeTimer = setTimeout(() => {
      if (!frontFired) {
        setState(prev => ({ ...prev, loading: false, isDevMode: true }))
      }
    }, 1500)

    import('@frontapp/plugin-sdk')
      .then(module => {
        const Front = module.default
        subscription = Front.contextUpdates.subscribe((context: any) => {
          frontFired = true
          clearTimeout(devModeTimer)

          if (context.type === 'noConversation') {
            setState({
              contactEmail: null,
              conversationId: null,
              hasConversation: false,
              loading: false,
              isDevMode: false,
            })
            return
          }

          if (context.type === 'singleConversation') {
            const email: string | null =
              context.contact?.handle ??
              context.conversation?.recipient?.handle ??
              null

            setState({
              contactEmail: email,
              conversationId: context.conversation?.id ?? null,
              hasConversation: true,
              loading: true,
              isDevMode: false,
            })

            // 300ms skeleton on each new conversation
            setTimeout(() => {
              setState(prev => ({ ...prev, loading: false }))
            }, 300)
          }
        })
      })
      .catch(() => {
        // Front SDK threw (not in correct environment) → dev mode
        clearTimeout(devModeTimer)
        setState(prev => ({ ...prev, loading: false, isDevMode: true }))
      })

    return () => {
      clearTimeout(devModeTimer)
      subscription?.unsubscribe?.()
    }
  }, [])

  return state
}
