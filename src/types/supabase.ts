export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    full_name: string | null
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    full_name?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_url?: string | null
                    full_name?: string | null
                    updated_at?: string
                }
            }
            lift_types: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    category: string | null
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    category?: string | null
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    category?: string | null
                }
            }
            logs: {
                Row: {
                    id: number
                    user_id: string
                    lift_type_id: number | null
                    lift_name: string | null
                    weight: number
                    unit: string | null
                    reps: number
                    rpe: number | null
                    date_logged: string
                    notes: string | null
                    is_pr: boolean | null
                }
                Insert: {
                    id?: number
                    user_id: string
                    lift_type_id?: number | null
                    lift_name?: string | null
                    weight: number
                    unit?: string | null
                    reps: number
                    rpe?: number | null
                    date_logged?: string
                    notes?: string | null
                    is_pr?: boolean | null
                }
                Update: {
                    id?: number
                    user_id?: string
                    lift_type_id?: number | null
                    lift_name?: string | null
                    weight?: number
                    unit?: string | null
                    reps?: number
                    rpe?: number | null
                    date_logged?: string
                    notes?: string | null
                    is_pr?: boolean | null
                }
            }
            body_measurements: {
                Row: {
                    id: number
                    user_id: string
                    weight: number
                    unit: string | null
                    notes: string | null
                    date_logged: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    weight: number
                    unit?: string | null
                    notes?: string | null
                    date_logged?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    weight?: number
                    unit?: string | null
                    notes?: string | null
                    date_logged?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "body_measurements_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            comments: {
                Row: {
                    id: number
                    user_id: string
                    log_id: number
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    log_id: number
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    log_id?: number
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_log_id_fkey"
                        columns: ["log_id"]
                        isOneToOne: false
                        referencedRelation: "logs"
                        referencedColumns: ["id"]
                    }
                ]
            }
            likes: {
                Row: {
                    id: number
                    user_id: string
                    log_id: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    log_id: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    log_id?: number
                    created_at?: string
                }
            }
        }
    }
}
