import { useState, useEffect } from 'react'
import Front from '@frontapp/plugin-sdk'

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
    let frontFired = false

    // If Front SDK hasn't called back in 1.5s, we're running outside Front
    const devModeTimer = setTimeout(() => {
      if (!frontFired) {
        setState(prev => ({ ...prev, loading: false, isDevMode: true }))
      }
    }, 1500)

    // Static import ensures the SDK is ready before Front's handshake arrives
    const subscription = Front.contextUpdates.subscribe((context: any) => {
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

    return () => {
      clearTimeout(devModeTimer)
      subscription?.unsubscribe?.()
    }
  }, [])

  return state
}
