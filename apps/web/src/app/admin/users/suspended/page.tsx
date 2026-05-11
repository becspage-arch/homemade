import { redirect } from 'next/navigation'

export default function SuspendedUsersRedirect() {
  redirect('/admin/users?suspended=1')
}
