'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUserId(user.id)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error loading profile:', error)
                toast.error('Failed to load profile')
            } else if (data) {
                const profile = data as Profile
                setFullName(profile.full_name || '')
                setAvatarUrl(profile.avatar_url || '')
            }

            setLoading(false)
        }

        getProfile()
    }, [router, supabase])

    const updateProfile = async () => {
        if (!userId) return

        setUpdating(true)
        const updates = {
            id: userId,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('profiles').upsert(updates as any)

        if (error) {
            toast.error('Failed to update profile')
            console.error(error)
        } else {
            toast.success('Profile updated!')
            router.refresh()
        }
        setUpdating(false)
    }

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading profile...</div>
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Profile</h1>

            <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                {/* Avatar Preview */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No Img
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Avatar Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                if (!e.target.files || e.target.files.length === 0) return
                                const file = e.target.files[0]
                                const fileExt = file.name.split('.').pop()
                                const filePath = `${userId}-${Math.random()}.${fileExt}`
                                setUpdating(true)

                                const { error: uploadError } = await supabase.storage
                                    .from('avatars')
                                    .upload(filePath, file)

                                if (uploadError) {
                                    toast.error('Error uploading image')
                                    console.error(uploadError)
                                    setUpdating(false)
                                    return
                                }

                                const { data: { publicUrl } } = supabase.storage
                                    .from('avatars')
                                    .getPublicUrl(filePath)

                                setAvatarUrl(publicUrl)
                                setUpdating(false)
                            }}
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Or paste a URL below:
                    </p>
                    <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                </div>

                <button
                    onClick={updateProfile}
                    className="btn btn-primary"
                    disabled={updating}
                    style={{ width: '100%', padding: '12px' }}
                >
                    {updating ? 'Saving...' : 'Update Profile'}
                </button>
            </div>
        </div>
    )
}
