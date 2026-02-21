import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { router } from '@/app/routes'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
