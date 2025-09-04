import Link from 'next/link'
import AuthButton from './AuthButton'

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="font-bold">OnePage</Link>
      <nav className="flex gap-4">
        <AuthButton />
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </header>
  )
}
