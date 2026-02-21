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

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const signIn = useAuthStore((s) => s.signIn)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await signIn(values.email, values.password)
      toast({ title: 'Connexion réussie' })
      navigate('/app', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    }
  }

  async function onGoogleClick() {
    try {
      await signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur Google'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="vous@exemple.com" {...field} />
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ou</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={onGoogleClick}>
        Continuer avec Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Pas de compte ?{' '}
        <Link to="/register" className="underline hover:text-foreground">
          S'inscrire
        </Link>
      </p>
    </div>
  )
}
