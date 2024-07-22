import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/_layout-settings/settings/')({
  component: () => <div>Hello /(authenticated)/_layout/settings/!</div>
})