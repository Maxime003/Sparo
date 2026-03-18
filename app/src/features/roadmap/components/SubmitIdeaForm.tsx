import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubmitIdea } from '../hooks/useIdeas'

interface SubmitIdeaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitIdeaForm({ open, onOpenChange }: SubmitIdeaFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const submitIdea = useSubmitIdea()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    submitIdea.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Proposer une idée</DialogTitle>
          <DialogDescription>
            Décris ton idée. Elle sera soumise à validation avant d'être visible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea-title">Titre *</Label>
            <Input
              id="idea-title"
              placeholder="Ton idée en quelques mots"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-desc">Description (optionnel)</Label>
            <textarea
              id="idea-desc"
              placeholder="Détaille ton idée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!title.trim() || submitIdea.isPending}>
              {submitIdea.isPending ? 'Envoi...' : 'Soumettre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
