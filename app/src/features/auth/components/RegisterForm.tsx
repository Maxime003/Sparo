import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { useAuthStore } from '@/features/auth/stores/authStore'

const registerSchema = z.object({
  fullName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const signUp = useAuthStore((s) => s.signUp)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await signUp(values.email, values.password, values.fullName)
      toast({
        title: 'Compte créé',
        description: 'Pense à valider ton adresse email via le lien envoyé dans ta boîte mail (vérifie aussi les spams).',
      })
      navigate('/app', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border border-border">
        Après l'inscription, un email de validation te sera envoyé. Pense à cliquer sur le lien reçu pour valider ton adresse email (vérifie aussi les courriers indésirables).
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ton@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="6 caractères min." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Inscription...' : 'Commencer'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link to="/login" className="underline hover:text-foreground">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
