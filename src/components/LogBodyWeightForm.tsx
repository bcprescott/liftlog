'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './LogLiftForm.module.css' // Re-using for consistency

export default function LogBodyWeightForm({ onLogSuccess }: { onLogSuccess: () => void }) {
    const [weight, setWeight] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!weight) return

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error('You must be logged in')
            setLoading(false)
            return
        }

        const { error } = await (supabase.from('body_measurements') as any).insert({
            user_id: user.id,
            weight: parseFloat(weight),
            unit: 'lbs', // Default for now
            date_logged: new Date().toISOString()
        })

        if (error) {
            console.error(error)
            toast.error('Failed to log body weight')
        } else {
            toast.success('Body weight logged!')
            setWeight('')
            onLogSuccess()
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formCard}>
            <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Body Weight (lbs)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 185.5"
                        required
                        className={styles.input}
                    />
                </div>
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                    style={{ marginTop: '24px' }}
                >
                    {loading ? 'Logging...' : 'Log Weight'}
                </button>
            </div>
        </form>
    )
}
