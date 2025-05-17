import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/recipient',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/_dashboardLayout/recipient"!</div>
}
