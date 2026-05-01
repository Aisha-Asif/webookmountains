export type UserRole = 'customer' | 'guide' | 'admin'

export interface User {
  id: string
  username: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Guide {
  id: string
  user_id: string
  bio: string
  experience_years: number
  specialties: string[]
  certifications: string[]
  is_verified: boolean
  verification_status: 'pending' | 'approved' | 'rejected'
  rating: number
  total_reviews: number
  total_trips: number
  payout_account_set: boolean
  created_at: string
  user?: User
}

export interface Trip {
  id: string
  guide_id: string
  title: string
  description: string
  mountain: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration_days: number
  max_participants: number
  price_per_person: number
  deposit_percent: number
  cancellation_policy: 'flexible' | 'moderate' | 'strict'
  includes: string[]
  requirements: string[]
  meeting_point: string
  image_url: string
  is_active: boolean
  created_at: string
  guide?: Guide
}

export interface Booking {
  id: string
  trip_id: string
  customer_id: string
  guide_id: string
  trip_date: string
  participants: number
  total_amount: number
  deposit_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed'
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded' | 'failed'
  special_requests?: string
  created_at: string
  trip?: Trip
  customer?: User
  guide?: Guide
}

export interface Review {
  id: string
  booking_id: string
  trip_id: string
  customer_id: string
  guide_id: string
  rating: number
  comment: string
  created_at: string
  customer?: User
}

export interface Dispute {
  id: string
  booking_id: string
  raised_by: string
  issue_type: 'refund' | 'guide_conduct' | 'trip_quality' | 'safety' | 'other'
  description: string
  status: 'open' | 'under_review' | 'resolved' | 'closed'
  resolution?: string
  created_at: string
  booking?: Booking
}

export interface AuthUser {
  id: string
  username: string
  full_name: string
  role: UserRole
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
