import { gs } from '@servicenow/glide'
import { gr } from '../lib/glide.ts'

/*
 * Settings module pattern: one place that names every app property, reads it with a safe default,
 * validates what admins save, and returns the same typed object the Properties page edits.
 * The properties themselves are defined in src/fluent/settings.now.ts.
 */
export const PROPS = {
    instanceTheme: 'x_starter.ui.instance_theme',
    searchLimit: 'x_starter.search.limit',
}

export interface Settings {
    instance_theme: boolean
    search_limit: number
}

export function instanceTheme(): boolean {
    return gs.getProperty(PROPS.instanceTheme, 'false') === 'true'
}

export function searchLimit(): number {
    const n = parseInt(gs.getProperty(PROPS.searchLimit, '20'), 10)
    return isNaN(n) || n < 1 ? 20 : Math.min(n, 100)
}

/**
 * The signed-in user's own Next Experience theme preference (name and light/dark appearance),
 * shown on the Properties page so admins can see what "follow each user's theme" will use.
 */
export function userTheme(): { name: string; appearance: string } {
    let id = ''
    let variant = ''
    try {
        const u = gs.getUser() as any
        id = u.getPreference('glide.ui.polaris.theme') || ''
        variant = u.getPreference('glide.ui.polaris.theme.variant') || ''
    } catch (e) {
        /* preferences unavailable: report the defaults */
    }
    let name = ''
    if (id) {
        try {
            const t = gr('sys_ux_theme')
            if (t.get(id)) name = t.getValue('name')
        } catch (e) {
            /* theme table not readable from this scope */
        }
    }
    return { name: name || 'Instance default', appearance: variant || 'default' }
}

export function getSettings(): Settings {
    return {
        instance_theme: instanceTheme(),
        search_limit: searchLimit(),
    }
}

function setProperty(name: string, value: string) {
    const p = gr('sys_properties')
    if (!p.get('name', name)) throw new Error(`Property ${name} is missing - reinstall the application`)
    p.setValue('value', value)
    p.update()
}

/** Validates and saves the settings an admin changed; returns the saved values. */
export function saveSettings(input: Partial<Settings>): Settings {
    if (input.instance_theme !== undefined) setProperty(PROPS.instanceTheme, input.instance_theme ? 'true' : 'false')
    if (input.search_limit !== undefined) {
        const n = Math.floor(Number(input.search_limit))
        if (!(n >= 1 && n <= 100)) throw new Error('Search limit must be between 1 and 100')
        setProperty(PROPS.searchLimit, String(n))
    }
    gs.info(`Starter App: ${gs.getUserName()} changed settings (${Object.keys(input).join(', ')})`)
    return getSettings()
}
