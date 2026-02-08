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
    const [isMenuOpen, setIsMenuOpen] = useState(false)
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

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logo}>
                LiftLog
            </Link>

            <button
                className={styles.mobileMenuBtn}
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
            </button>

            <div className={`${styles.links} ${isMenuOpen ? styles.linksOpen : ''}`}>
                <ThemeToggle />

                {user ? (
                    <>
                        <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.linkActive : ''}`}>
                            Dashboard
                        </Link>
                        <Link href="/leaderboard" className={`${styles.link} ${pathname === '/leaderboard' ? styles.linkActive : ''}`}>
                            Leaderboard
                        </Link>
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
