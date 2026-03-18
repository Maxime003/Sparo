import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAddPendingExpense } from '../hooks/usePendingExpenses'

const schema = z.object({
  amount: z.coerce.number().positive('Le montant doit être supérieur à 0'),
  description: z.string().min(1, 'Description requise'),
  expense_date: z.string().min(1, 'Date requise'),
})

type FormValues = z.infer<typeof schema>

export function PendingExpenseForm() {
  const { toast } = useToast()
  const addExpense = useAddPendingExpense()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      amount: '' as unknown as number,
      description: '',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await addExpense.mutateAsync(values)
      toast({ title: 'Dépense ajoutée' })
      form.reset({
        amount: '' as unknown as number,
        description: '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter la dépense.', variant: 'destructive' })
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h2 className="text-lg font-semibold">Ajouter une dépense</h2>
        <p className="text-sm text-muted-foreground">
          Ajoute les dépenses pas encore prélevées par ta banque
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="25.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Restaurant hier soir" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de la dépense</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={addExpense.isPending}>
              {addExpense.isPending ? 'Ajout...' : 'Ajouter la dépense'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
