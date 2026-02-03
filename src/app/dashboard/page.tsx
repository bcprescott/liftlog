'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LogLiftForm from '@/components/LogLiftForm'
import ProgressChart from '@/components/ProgressChart'
import ActivityHeatmap from '@/components/ActivityHeatmap'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type LogEntry = Database['public']['Tables']['logs']['Row'] & {
    lift_types: Database['public']['Tables']['lift_types']['Row'] | null
}
type LiftType = Database['public']['Tables']['lift_types']['Row']

export default function Dashboard() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [liftTypes, setLiftTypes] = useState<LiftType[]>([])
    const [selectedLiftForChart, setSelectedLiftForChart] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [editingLog, setEditingLog] = useState<LogEntry | null>(null)

    const supabase = createClient()
    const router = useRouter()

    const fetchLogs = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data, error } = await supabase
            .from('logs')
            .select(`
        *,
        lift_types (
          *
        )
      `)
            .eq('user_id', user.id)
            .order('date_logged', { ascending: false })
            .limit(50)

        if (data) setLogs(data as any)
        setLoading(false)
        setEditingLog(null)
    }

    const [chartLogs, setChartLogs] = useState<LogEntry[]>([])

    const fetchChartData = async (liftId: string) => {
        if (!liftId) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('lift_type_id', liftId)
            .order('date_logged', { ascending: false })

        if (data) setChartLogs(data as any)
    }

    useEffect(() => {
        if (selectedLiftForChart) {
            fetchChartData(selectedLiftForChart)
        }
    }, [selectedLiftForChart])

    const fetchLiftTypes = async () => {
        const { data } = await supabase.from('lift_types').select('*').order('name')
        if (data && data.length > 0) {
            const lifts = data as LiftType[]
            setLiftTypes(lifts)
            setSelectedLiftForChart(lifts[0].id.toString())
        }
    }

    useEffect(() => {
        fetchLogs()
        fetchLiftTypes()
    }, [])

    const deleteLog = async (id: number) => {
        if (!confirm('Are you sure you want to delete this log?')) return;

        const { error } = await supabase
            .from('logs')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting log:', error)
            toast.error('Failed to delete log')
        } else {
            setLogs(logs.filter(log => log.id !== id))
            toast.success('Log deleted')
        }
    }


    return (
        <div>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your progress</p>
            </div>

            <LogLiftForm
                onLogSuccess={fetchLogs}
                initialData={editingLog}
                onCancel={() => setEditingLog(null)}
            />

            {logs.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Progress</h2>
                        <select
                            value={selectedLiftForChart}
                            onChange={(e) => setSelectedLiftForChart(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            {liftTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <ProgressChart logs={chartLogs} />
                </div>
            )}

            <h2 className={styles.sectionTitle}>Recent Activity</h2>

            {loading ? (
                <p>Loading history...</p>
            ) : logs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No lifts logged yet. Get to work!</p>
            ) : (
                <div className={styles.logsList}>
                    {logs.map((log) => (
                        <div key={log.id} className={styles.logCard}>
                            <div className={styles.logMain}>
                                <span className={styles.liftName}>{log.lift_types?.name || log.lift_name}</span>
                                <span className={styles.liftStats}>
                                    {log.weight} lbs × {log.reps} reps
                                    {log.rpe && <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '8px' }}>@ RPE {log.rpe}</span>}
                                    <span style={{ fontSize: '0.8em', color: 'var(--brand-primary)', marginLeft: '8px', fontWeight: '600' }}>
                                        (1RM: {Math.round(log.weight * (1 + log.reps / 30))})
                                    </span>
                                    {(log as any).body_weight && (
                                        <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                            [BW: {(log as any).body_weight}]
                                        </span>
                                    )}
                                </span>
                                {log.notes && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                                        {log.notes}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                <div className={styles.liftDate}>
                                    {new Date(log.date_logged).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                        className="btn btn-sm"
                                        style={{ fontSize: '0.8rem', padding: '2px 8px', backgroundColor: 'transparent', border: '1px solid var(--border)' }}
                                        onClick={() => {
                                            setEditingLog(log)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ fontSize: '0.8rem', padding: '2px 8px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--error, #ef4444)' }}
                                        onClick={() => deleteLog(log.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
