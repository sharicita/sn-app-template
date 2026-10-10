declare global {
    interface Window {
        g_ck: string
    }
}

// Scripted REST API base path: /api/<scope>/<serviceId> (src/fluent/rest/api.now.ts)
const BASE = '/api/x_starter/app'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-UserToken': window.g_ck,
            ...(init.headers || {}),
        },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        const message = data?.result?.error?.message || data?.error?.message
        throw new Error(message || `Request failed (${response.status})`)
    }
    return data.result as T
}

export interface Me {
    user: string
    is_admin: boolean
    instance_theme?: boolean
    theme?: { name: string; appearance: string }
}

export interface Settings {
    instance_theme: boolean
    search_limit: number
}

export interface GroupRow {
    sys_id: string
    name: string
    description: string
    email: string
}

export const Api = {
    me: () => request<Me>('/me'),
    search: (q: string) => request<GroupRow[]>(`/search?q=${encodeURIComponent(q)}`),
    getSettings: () => request<Settings>('/admin/settings'),
    saveSettings: (s: Partial<Settings>) => request<Settings>('/admin/settings', { method: 'PUT', body: JSON.stringify(s) }),
}
