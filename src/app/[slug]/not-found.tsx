import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>This portfolio doesn&apos;t exist yet.</p>
      <Link href="/admin" className="btn btn-primary">
        Create Your Portfolio
      </Link>
    </div>
  )
}
