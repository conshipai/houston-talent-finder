// lib/profile-required.ts
// Profile fields that must be filled in before a profile can be saved.
// Shared by the edit form (to show/jump to missing fields) and the API (to enforce it).

export type ProfileTab = 'basic' | 'physical' | 'professional' | 'links'

export const REQUIRED_PROFILE_FIELDS = [
  { name: 'stageName', label: 'Stage/Professional Name', tab: 'basic' },
  { name: 'age', label: 'Age', tab: 'basic' },
  { name: 'email', label: 'Email', tab: 'basic' },
  { name: 'phone', label: 'Phone Number', tab: 'basic' },
  { name: 'bio', label: 'Bio / About Me', tab: 'basic' },
  { name: 'city', label: 'City', tab: 'basic' },
  { name: 'state', label: 'State', tab: 'basic' },
  { name: 'sexualOrientation', label: 'Sexual Orientation', tab: 'basic' },
  { name: 'bodyType', label: 'Body Type', tab: 'physical' },
  { name: 'height', label: 'Height', tab: 'physical' },
  { name: 'hairColor', label: 'Hair Color', tab: 'physical' },
  { name: 'eyeColor', label: 'Eye Color', tab: 'physical' },
  { name: 'ethnicity', label: 'Ethnicity', tab: 'physical' },
  { name: 'jobTypes', label: 'Types of Work Interested In', tab: 'professional' },
  { name: 'availability', label: 'Availability', tab: 'professional' },
] as const satisfies readonly { name: string; label: string; tab: ProfileTab }[]

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Returns the required fields that are missing or invalid in `data`.
export function missingProfileFields(data: Record<string, unknown>) {
  return REQUIRED_PROFILE_FIELDS.filter(field => {
    const value = data[field.name]
    if (Array.isArray(value)) return value.length === 0
    const text = value == null ? '' : String(value).trim()
    if (!text) return true
    if (field.name === 'age') return !(parseInt(text, 10) >= 18)
    if (field.name === 'email') return !EMAIL_PATTERN.test(text)
    return false
  })
}
