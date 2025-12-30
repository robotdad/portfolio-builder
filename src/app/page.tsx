import Link from 'next/link'

export default function Home() {
  return (
    <div className="not-found">
      <h1>Portfolio Builder</h1>
      <p>Create your professional portfolio in minutes.</p>
      <Link href="/admin" className="btn btn-primary">
        Get Started
      </Link>
    </div>
  )
}
