import React, { useEffect, useState } from 'react'
import { Api, Settings } from '../services/Api'
import { APP_NAME } from '../utils/nav'
import Tip from './Tip'
import ConfigNav, { ConfigView } from './ConfigNav'
import FieldInfo from './FieldInfo'

interface Props {
    onSaved: (s: Settings) => void
    onNavigate: (view: ConfigView) => void
}

/** Properties page (admins): one card per concern, an ⓘ on each setting, Save / Discard. */
export default function SettingsView({ onSaved, onNavigate }: Props) {
    const [saved, setSaved] = useState<Settings | null>(null)
    const [form, setForm] = useState<Settings | null>(null)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [theme, setTheme] = useState<{ name: string; appearance: string } | null>(null)

    useEffect(() => {
        Api.me()
            .then((m) => setTheme(m.theme || null))
            .catch(() => undefined)
        Api.getSettings()
            .then((s) => {
                setSaved(s)
                setForm(s)
            })
            .catch((e) => setError(e.message))
    }, [])

    if (error && !form) return <div className="app-alert app-alert--critical">{error}</div>
    if (!form || !saved) return <p className="app-muted">Loading settings…</p>
    const dirty = JSON.stringify(form) !== JSON.stringify(saved)

    const save = async () => {
        setBusy(true)
        setError('')
        setMessage('')
        try {
            const s = await Api.saveSettings(form)
            setSaved(s)
            setForm(s)
            onSaved(s)
            setMessage('Settings saved.')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="app-settings">
            <ConfigNav current="settings" onNavigate={onNavigate} />
            {message && (
                <div className="app-alert app-alert--positive" role="status">
                    {message}
                </div>
            )}
            {error && <div className="app-alert app-alert--critical">{error}</div>}

            <section className="app-card" aria-labelledby="set-appearance">
                <div className="app-card__header">
                    <h2 id="set-appearance">Appearance</h2>
                </div>
                <div className="app-card__body app-settings__body">
                    <div className="app-switch-row">
                        <label className="app-switch">
                            <input type="checkbox" checked={!!form.instance_theme} onChange={(e) => setForm({ ...form, instance_theme: e.target.checked })} />
                            <span>
                                <strong>Follow each user's ServiceNow theme</strong>
                            </span>
                        </label>
                        <FieldInfo
                            label="Follow each user's ServiceNow theme"
                            text={`Off: ${APP_NAME} uses its own fixed colours. On: everyone sees ${APP_NAME} in the theme they picked in ServiceNow (Preferences > Theme), including dark appearance. Status colours stay the same. Applies after saving.`}
                        />
                    </div>
                    <p className="app-theme-now" aria-live="polite">
                        <span>
                            Your theme: <strong>{theme ? theme.name : '…'}</strong>
                            {theme && theme.appearance !== 'default' ? ` (${theme.appearance})` : ''}
                        </span>
                        <span className="app-theme-swatch" data-tip={`The accent colour ${APP_NAME} is using right now`}>
                            <i style={{ background: 'var(--app-accent)' }} aria-hidden="true" /> accent
                        </span>
                        <span className="app-theme-swatch" data-tip={`The page and card colours ${APP_NAME} is using right now`}>
                            <i style={{ background: 'var(--app-surface)' }} aria-hidden="true" />
                            <i style={{ background: 'var(--app-bg)' }} aria-hidden="true" /> surfaces
                        </span>
                        <span className="app-muted">
                            {form.instance_theme === saved.instance_theme ? (saved.instance_theme ? 'Following your theme.' : `Using ${APP_NAME} colours.`) : 'Save to apply.'}
                        </span>
                    </p>
                </div>
            </section>

            <section className="app-card" aria-labelledby="set-search">
                <div className="app-card__header">
                    <h2 id="set-search">Search</h2>
                </div>
                <div className="app-card__body app-settings__body">
                    <Tip id="settings-example">This card shows the pattern for an app setting: replace it with your own. Each setting needs a property, a line in the settings module and a field here.</Tip>
                    <div className="app-switch-row">
                        <label className="app-field app-settings__days">
                            <span className="app-field__label">Search results (most)</span>
                            <input
                                className="app-input"
                                type="number"
                                min={1}
                                max={100}
                                value={form.search_limit}
                                onChange={(e) => setForm({ ...form, search_limit: parseInt(e.target.value || '0', 10) })}
                            />
                        </label>
                        <FieldInfo label="Search results (most)" text="The most records one search returns, from 1 to 100. Applies to everyone after saving." />
                    </div>
                </div>
                <div className="app-card__footer">
                    <button type="button" className="app-btn app-btn--primary" disabled={!dirty || busy} onClick={save}>
                        {busy ? 'Saving…' : 'Save settings'}
                    </button>
                    <button type="button" className="app-btn app-btn--ghost" disabled={!dirty || busy} onClick={() => setForm(saved)}>
                        Discard changes
                    </button>
                </div>
            </section>
        </div>
    )
}
