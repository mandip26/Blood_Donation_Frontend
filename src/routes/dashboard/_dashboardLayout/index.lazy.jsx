import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className={"p-6"}></main>
}
