'use client'
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Database } from '@/types/supabase'

type LogEntry = Database['public']['Tables']['logs']['Row'] & {
    lift_types: Database['public']['Tables']['lift_types']['Row'] | null
}

interface ProgressChartProps {
    logs: LogEntry[]
}

export default function ProgressChart({ logs }: ProgressChartProps) {
    const data = useMemo(() => {
        const grouped = logs.reduce((acc, log) => {
            const date = new Date(log.date_logged).toLocaleDateString()
            if (!acc[date] || log.weight > acc[date].weight) {
                acc[date] = {
                    date,
                    weight: log.weight,
                    reps: log.reps, // Keep reps of the max weight set
                    fullDate: new Date(log.date_logged)
                }
            }
            return acc
        }, {} as Record<string, { date: string, weight: number, reps: number, fullDate: Date }>)

        // Sort by date ascending
        return Object.values(grouped).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
    }, [logs])

    if (data.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                No data available for this lift.
            </div>
        )
    }

    return (
        <div style={{ height: '300px', width: '100%', marginTop: '20px', marginBottom: '20px', background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '20px' }}>Progress History</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
