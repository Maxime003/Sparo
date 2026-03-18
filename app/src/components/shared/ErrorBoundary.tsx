import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
          <p className="text-muted-foreground">
            Quelque chose s'est mal passé. Recharge la page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
