import Link from 'next/link'
export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="font-bold">OnePage</Link>
      <nav className="flex gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>
  )
}
