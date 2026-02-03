'use client'
import { useMemo } from 'react'
import { Database } from '@/types/supabase'

type LogEntry = Database['public']['Tables']['logs']['Row']

interface ActivityHeatmapProps {
    logs: LogEntry[]
}

export default function ActivityHeatmap({ logs }: ActivityHeatmapProps) {
    const heatmapData = useMemo(() => {
        const today = new Date()
        const days = []
        // Generate last 60 days
        for (let i = 59; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toLocaleDateString()

            // Count logs for this day
            const count = logs.filter(l => new Date(l.date_logged).toLocaleDateString() === dateStr).length
            days.push({ date: d, count })
        }
        return days
    }, [logs])

    return (
        <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Consistency</h3>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {heatmapData.map((day, i) => {
                    let opacity = 0.1
                    if (day.count > 0) opacity = 0.4
                    if (day.count > 1) opacity = 0.7
                    if (day.count > 3) opacity = 1

                    return (
                        <div
                            key={i}
                            title={`${day.date.toLocaleDateString()}: ${day.count} workouts`}
                            style={{
                                width: '12px',
                                height: '12px',
                                background: `var(--primary)`,
                                opacity: opacity,
                                borderRadius: '2px'
                            }}
                        />
                    )
                })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                Last 60 Days
            </div>
        </div>
    )
}
