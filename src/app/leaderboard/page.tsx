'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './leaderboard.module.css'
import { Database } from '@/types/supabase'
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Comment = Database['public']['Tables']['comments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null
}

type LogEntry = Database['public']['Tables']['logs']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null
    lift_types: Database['public']['Tables']['lift_types']['Row'] | null
    likes: { user_id: string }[]
    comments: { count: number }[]
}

const CommentsSection = ({ logId, userId }: { logId: number, userId: string | null }) => {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)
    const supabase = createClient()

    const fetchComments = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('comments')
            .select(`
                *,
                profiles (
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('log_id', logId)
            .order('created_at', { ascending: true })

        if (data) setComments(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchComments()
    }, [logId])

    const postComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId || !newComment.trim()) return

        setPosting(true)
        const { error } = await supabase.from('comments').insert({
            log_id: logId,
            user_id: userId,
            content: newComment.trim()
        } as any)

        if (error) {
            toast.error('Failed to post comment')
        } else {
            setNewComment('')
            fetchComments()
        }
        setPosting(false)
    }

    const deleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        const { error } = await supabase.from('comments').delete().eq('id', commentId)
        if (error) {
            toast.error('Failed to delete comment')
        } else {
            setComments(comments.filter(c => c.id !== commentId))
            toast.success('Comment deleted')
        }
    }

    return (
        <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
            {loading ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading comments...</div>
            ) : comments.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>No comments yet. Be the first!</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                    {comments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                                {comment.profiles?.avatar_url && <img src={comment.profiles.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>
                                        {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '8px' }}>
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </span>
                                    {userId === comment.user_id && (
                                        <button
                                            onClick={() => deleteComment(comment.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                                            title="Delete comment"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{comment.content}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {userId ? (
                <form onSubmit={postComment} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" disabled={posting} className="btn btn-sm" style={{ display: 'flex', alignItems: 'center' }}>
                        <Send size={16} />
                    </button>
                </form>
            ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Log in to comment</div>
            )}
        </div>
    )
}

export default function LeaderboardPage() {
    const [liftTypes, setLiftTypes] = useState<Database['public']['Tables']['lift_types']['Row'][]>([])
    const [selectedLift, setSelectedLift] = useState<string>('latest')
    const [leaders, setLeaders] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const fetchLiftTypes = async () => {
            const { data } = await supabase.from('lift_types').select('*').order('name')
            if (data && data.length > 0) setLiftTypes(data)
        }
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }
        fetchLiftTypes()
        getUser()
    }, [])

    const fetchLeaderboard = async () => {
        setLoading(true)

        let query = supabase
            .from('logs')
            .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          ),
          lift_types (
            name
          ),
          likes!left (
            user_id
          ),
          comments!left (
            count
          )
        `)

        if (selectedLift === 'latest') {
            query = query.order('date_logged', { ascending: false })
        } else {
            query = query
                .eq('lift_type_id', parseInt(selectedLift))
                .order('weight', { ascending: false })
        }

        const { data, error } = await query.limit(50)

        if (data) setLeaders(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchLeaderboard()
    }, [selectedLift])

    const toggleLike = async (logId: number, currentLikes: { user_id: string }[]) => {
        if (!userId) {
            toast.error('Please log in to like lifts')
            return
        }

        const isLiked = currentLikes.some(l => l.user_id === userId)

        const updatedLeaders = leaders.map(l => {
            if (l.id === logId) {
                return {
                    ...l,
                    likes: isLiked ? l.likes.filter(like => like.user_id !== userId) : [...l.likes, { user_id: userId }]
                }
            }
            return l
        })
        setLeaders(updatedLeaders)

        if (isLiked) {
            await supabase.from('likes').delete().match({ user_id: userId, log_id: logId })
        } else {
            await supabase.from('likes').insert({ user_id: userId, log_id: logId } as any)
        }
    }


    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>Leaderboard</h1>
                <select
                    className={styles.filterSelect}
                    value={selectedLift}
                    onChange={(e) => setSelectedLift(e.target.value)}
                >
                    <option value="latest">Latest Lifts</option>
                    {liftTypes.map((lift) => (
                        <option key={lift.id} value={lift.id}>{lift.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table} style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Lifter</th>
                            <th>Lift</th>
                            <th>Weight</th>
                            <th>Date</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : leaders.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center' }}>No lifts...</td></tr>
                        ) : (
                            leaders.map((entry, index) => {
                                const isLiked = entry.likes?.some(l => l.user_id === userId)
                                const isExpanded = expandedLogId === entry.id
                                const commentCount = entry.comments?.[0]?.count || 0

                                return (
                                    <>
                                        <tr key={entry.id} style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)' }}>
                                            <td className={styles.rank}>#{index + 1}</td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    {entry.profiles?.avatar_url && (
                                                        <img src={entry.profiles.avatar_url} alt="avatar" className={styles.avatar} />
                                                    )}
                                                    <span>{entry.profiles?.full_name || entry.profiles?.username || 'Anonymous'}</span>
                                                </div>
                                            </td>
                                            <td>{entry.lift_types?.name || entry.lift_name || '-'}</td>
                                            <td className={styles.weight}>{entry.weight} {entry.unit}</td>
                                            <td className={styles.date}>{new Date(entry.date_logged).toLocaleDateString()}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                                {entry.notes || '-'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <button
                                                        onClick={() => toggleLike(entry.id, entry.likes || [])}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}
                                                    >
                                                        <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
                                                        <span>{entry.likes?.length || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: isExpanded ? 'var(--brand-primary)' : 'inherit' }}
                                                    >
                                                        <MessageCircle size={18} />
                                                        <span>{commentCount}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: 0 }}>
                                                    <CommentsSection logId={entry.id} userId={userId} />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
