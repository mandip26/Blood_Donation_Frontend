import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/edit-password',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/_dashboardLayout/edit-password"!</div>
}
