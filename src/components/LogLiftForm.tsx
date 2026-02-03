'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './LogLiftForm.module.css'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

type LiftType = Database['public']['Tables']['lift_types']['Row']
type LogEntry = Database['public']['Tables']['logs']['Row']
type LogInsert = Database['public']['Tables']['logs']['Insert']
type LogUpdate = Database['public']['Tables']['logs']['Update']

interface LogLiftFormProps {
    onLogSuccess: () => void
    initialData?: LogEntry | null
    onCancel?: () => void
}

export default function LogLiftForm({ onLogSuccess, initialData, onCancel }: LogLiftFormProps) {
    const [liftTypes, setLiftTypes] = useState<LiftType[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form State
    const [selectedLift, setSelectedLift] = useState<string>('')
    const [weight, setWeight] = useState('')
    const [bodyWeight, setBodyWeight] = useState('')
    const [reps, setReps] = useState('')
    const [rpe, setRpe] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        const fetchLiftTypes = async () => {
            const { data } = await supabase.from('lift_types').select('*').order('name')
            if (data) setLiftTypes(data)
        }
        fetchLiftTypes()
    }, [])

    useEffect(() => {
        if (initialData) {
            setSelectedLift(initialData.lift_type_id?.toString() || '')
            setWeight(initialData.weight.toString())
            setBodyWeight((initialData as any).body_weight?.toString() || '')
            setReps(initialData.reps.toString())
            setRpe(initialData.rpe ? initialData.rpe.toString() : '')
            setNotes(initialData.notes || '')
        } else {
            // Reset if no initial data (switching from edit to create)
            setSelectedLift('')
            setWeight('')
            setBodyWeight('')
            setReps('')
            setRpe('')
            setNotes('')
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('You must be logged in')
            setLoading(false)
            return
        }

        const payload: any = {
            user_id: user.id,
            lift_type_id: parseInt(selectedLift),
            weight: parseFloat(weight),
            body_weight: bodyWeight ? parseFloat(bodyWeight) : null,
            reps: parseInt(reps),
            rpe: rpe ? parseInt(rpe) : null,
            notes: notes || null,
            date_logged: new Date().toISOString()
        }

        let error;

        if (initialData) {
            // Update existing
            const updatePayload = {
                ...payload,
                date_logged: initialData.date_logged
            }
            const { error: updateError } = await supabase
                .from('logs')
                .update(updatePayload as any)
                .eq('id', initialData.id)
            error = updateError
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('logs')
                .insert(payload as any)
            error = insertError
        }

        if (error) {
            console.error('Error logging lift:', error)
            toast.error('Failed to log lift')
        } else {
            if (!initialData) {
                // Don't reset body weight completely as it might be constant for session
                // But for now let's reset to keep it clean
                // Actually user probably wants it to persist for next set?
                // taking user request "track what my body weight was at the time", 
                // typically changes infrequently. Let's keep it if set? 
                // Nah, let's reset everything for clarity unless user asks otherwise.
                setWeight('')
                // setBodyWeight('') // Let's keep body weight for convenience if they log multiple sets
                setReps('')
                setRpe('')
                setNotes('')

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                toast.success('Lift logged successfully!')
            } else {
                toast.success('Log updated!')
            }
            onLogSuccess()
            if (onCancel) onCancel();
        }
        setLoading(false)
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1rem' }}>{initialData ? 'Edit Log' : 'Log a Set'}</h3>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Lift</label>
                    <select
                        className={styles.select}
                        value={selectedLift}
                        onChange={(e) => setSelectedLift(e.target.value)}
                        required
                    >
                        <option value="">Select Lift</option>
                        {liftTypes.map((lift) => (
                            <option key={lift.id} value={lift.id}>
                                {lift.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Body Weight (lbs)</label>
                    <input
                        type="number"
                        step="0.1"
                        className={styles.input}
                        value={bodyWeight}
                        onChange={(e) => setBodyWeight(e.target.value)}
                        placeholder="Optional"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Lift Weight (lbs)</label>
                    <input
                        type="number"
                        step="0.5"
                        className={styles.input}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        placeholder="0"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Reps</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        required
                        placeholder="0"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>RPE (1-10)</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        className={styles.input}
                        value={rpe}
                        onChange={(e) => setRpe(e.target.value)}
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                    className={`${styles.input} ${styles.textArea}`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it feel?"
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Saving...' : (initialData ? 'Update Log' : 'Log Lift')}
                </button>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn"
                        style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
