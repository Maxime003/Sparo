import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useComments, useAddComment } from '../hooks/useComments'
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface CommentSectionProps {
  featureId?: string
  ideaId?: string
  collapsible?: boolean
}

export function CommentSection({ featureId, ideaId, collapsible = false }: CommentSectionProps) {
  const { data: comments = [], isLoading } = useComments(featureId, ideaId)
  const addComment = useAddComment()
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(!collapsible)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !authorName.trim()) return

    addComment.mutate(
      {
        feature_id: featureId ?? null,
        idea_id: ideaId ?? null,
        author_name: authorName.trim(),
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setContent('')
        },
      }
    )
  }

  if (collapsible) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{comments.length} commentaire{comments.length !== 1 ? 's' : ''}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3">
            <CommentList comments={comments} isLoading={isLoading} />
            <CommentForm
              authorName={authorName}
              setAuthorName={setAuthorName}
              content={content}
              setContent={setContent}
              onSubmit={handleSubmit}
              isPending={addComment.isPending}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        Commentaires ({comments.length})
      </h4>
      <CommentList comments={comments} isLoading={isLoading} />
      <CommentForm
        authorName={authorName}
        setAuthorName={setAuthorName}
        content={content}
        setContent={setContent}
        onSubmit={handleSubmit}
        isPending={addComment.isPending}
      />
    </div>
  )
}

function CommentList({
  comments,
  isLoading,
}: {
  comments: { id: string; author_name: string; content: string; created_at: string }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-md bg-muted/50 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}

function CommentForm({
  authorName,
  setAuthorName,
  content,
  setContent,
  onSubmit,
  isPending,
}: {
  authorName: string
  setAuthorName: (v: string) => void
  content: string
  setContent: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Input
        placeholder="Ton nom"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter un commentaire..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim() || !authorName.trim()}
          className="h-8 px-3"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  )
}
