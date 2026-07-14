import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$roomId/notes/$noteId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$roomId/notes/$noteId"!</div>
}
