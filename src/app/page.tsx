export default async function Home() {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div style={{ padding: 'var(--spacing-xl) 0' }}>
            <h1>Welcome to LiftLog</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                Track your progress, join the leaderboard.
            </p>

            <div style={{ marginTop: 'var(--spacing-xl)' }}>
                {user ? (
                    <a href="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </a>
                ) : (
                    <a href="/login" className="btn btn-primary">
                        Get Started
                    </a>
                )}
            </div>
        </div>
    );
}
