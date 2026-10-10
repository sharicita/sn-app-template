import React, { useCallback, useEffect, useState } from 'react'
import { APP_NAME, getViewFromUrl, pushView, setTitle, ViewName, ViewState } from './utils/nav'
import Header from './components/Header'
import SettingsView from './components/SettingsView'
import TooltipLayer from './components/TooltipLayer'
import HomeView from './views/HomeView'
import { Api, Me } from './services/Api'

/** True when the user's ServiceNow theme has a dark page background (theme tokens are RGB triplets). */
export function themeIsDark(): boolean {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--now-color_background--primary').split(',').map((x) => parseInt(x, 10))
    if (rgb.length < 3 || rgb.some((x) => isNaN(x))) return false
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] < 110
}

const TITLES: { [v in ViewName]: string } = {
    home: `${APP_NAME}`,
    settings: `${APP_NAME} – Properties`,
}

export default function App() {
    const [view, setView] = useState<ViewState>(getViewFromUrl)
    // e.g. "External User Not Authorized" when the Explicit Roles plugin is active and the user lacks snc_internal
    const [accessProblem, setAccessProblem] = useState('')
    const [me, setMe] = useState<Me>({ user: '', is_admin: false })

    useEffect(() => {
        Api.me()
            .then(setMe)
            .catch((e) => setAccessProblem(String(e.message || '')))
    }, [])

    // admin setting: follow each user's own ServiceNow theme (and its dark appearance)
    useEffect(() => {
        const root = document.documentElement
        root.classList.toggle('app-theme-instance', !!me.instance_theme)
        root.classList.toggle('app-theme-dark', !!me.instance_theme && themeIsDark())
    }, [me.instance_theme])

    useEffect(() => {
        const onPop = () => setView(getViewFromUrl())
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    useEffect(() => setTitle(TITLES[view.view]), [view])

    const navigate = useCallback((name: ViewName, id?: string | null) => {
        pushView(name, id, TITLES[name])
        setView({ view: name, id: id || null })
    }, [])

    return (
        <div className="app">
            <Header view={view.view} isAdmin={me.is_admin} onNavigate={(v) => navigate(v)} />
            <main className="app__main">
                {accessProblem && (
                    <div className="app-alert app-alert--critical" role="alert">
                        {/external user/i.test(accessProblem) ? (
                            <>
                                <strong>ServiceNow treats your account as an external user, so {APP_NAME} can't load your data.</strong> This instance uses the Explicit Roles plugin:
                                ask an administrator to give you the <code>snc_internal</code> role (and the app's user role), then sign out and back in.
                            </>
                        ) : (
                            <>
                                <strong>{APP_NAME} couldn't check your access:</strong> {accessProblem}. You may need the app's user role (<code>x_starter.user</code>); ask an
                                administrator.
                            </>
                        )}
                    </div>
                )}
                {view.view === 'home' && <HomeView />}
                {view.view === 'settings' &&
                    (me.is_admin ? (
                        <SettingsView onNavigate={(v) => navigate(v)} onSaved={(s) => setMe({ ...me, instance_theme: s.instance_theme })} />
                    ) : (
                        <div className="app-alert app-alert--warning">Settings are available to {APP_NAME} admins (x_starter.admin).</div>
                    ))}
            </main>
            <TooltipLayer />
        </div>
    )
}
