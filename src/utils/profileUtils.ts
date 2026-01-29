import type { User } from '../types/api'

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

export const compactMetadata = (metadata: Record<string, unknown>) => {
  const keys = Object.keys(metadata)
  if (keys.length === 0) {
    return '-'
  }
  const raw = JSON.stringify(metadata)
  if (raw.length <= 120) {
    return raw
  }
  return `${raw.slice(0, 120)}...`
}

export const getDisplayName = (profile: User) => {
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ')
  return fullName || profile.username
}

export const getAvatarInitials = (profile: User, displayName: string) => {
  const first = profile.first_name?.trim()
  const last = profile.last_name?.trim()
  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase()
  }
  const fallback = (displayName || profile.username).trim()
  return fallback.slice(0, 2).toUpperCase()
}
