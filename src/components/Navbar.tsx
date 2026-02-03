'use client'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logo}>
                LiftLog
            </Link>

            <div className={styles.links}>
                <ThemeToggle />
                <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.linkActive : ''}`}>
                    Dashboard
                </Link>
                <Link href="/leaderboard" className={`${styles.link} ${pathname === '/leaderboard' ? styles.linkActive : ''}`}>
                    Leaderboard
                </Link>

                {user ? (
                    <>
                        <Link href="/profile" className={`${styles.link} ${pathname === '/profile' ? styles.linkActive : ''}`}>
                            Profile
                        </Link>
                        <button onClick={handleLogout} className={styles.link}>
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link href="/login" className={styles.link}>
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    )
}
