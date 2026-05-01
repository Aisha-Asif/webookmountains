import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function difficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    beginner: 'text-summit-400 bg-summit-950',
    intermediate: 'text-amber-400 bg-amber-950',
    advanced: 'text-orange-400 bg-orange-950',
    expert: 'text-red-400 bg-red-950',
  }
  return map[difficulty] || 'text-stone-400 bg-stone-800'
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'text-summit-400 bg-summit-950 border-summit-800',
    pending: 'text-amber-400 bg-amber-950 border-amber-800',
    completed: 'text-alpine-400 bg-alpine-950 border-alpine-800',
    cancelled: 'text-red-400 bg-red-950 border-red-800',
    disputed: 'text-orange-400 bg-orange-950 border-orange-800',
  }
  return map[status] || 'text-stone-400 bg-stone-800 border-stone-700'
}

export function cancellationPolicyText(policy: string): string {
  const map: Record<string, string> = {
    flexible: 'Full refund up to 7 days before trip',
    moderate: 'Full refund up to 14 days, 50% refund up to 7 days',
    strict: 'Non-refundable within 30 days of trip date',
  }
  return map[policy] || policy
}
