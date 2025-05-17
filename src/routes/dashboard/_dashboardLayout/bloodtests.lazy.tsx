import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/bloodtests',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/_dashboardLayout/bloodtests"!</div>
}
