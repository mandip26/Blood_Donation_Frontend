import { lazyRouteComponent } from '@tanstack/react-router'

export const Component = lazyRouteComponent(() => import('./create'))
