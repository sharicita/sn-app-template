import React from 'react'
import Icon from './Icon'
import { APP_NAME } from '../utils/nav'

export type ConfigView = 'settings'

interface Props {
    current: ConfigView
    onNavigate: (view: ConfigView) => void
}

/**
 * Sub-navigation shared by the Configuration pages (app admins only): Properties first, then
 * integrations, then links to provider / configuration lists. Add new admin pages here and as
 * modules under the Configuration separator (src/fluent/navigation/menu.now.ts).
 */
export default function ConfigNav({ current, onNavigate }: Props) {
    const item = (view: ConfigView, label: string, icon: string) => (
        <button
            type="button"
            className={`app-segment__item${current === view ? ' app-segment__item--on' : ''}`}
            aria-current={current === view ? 'page' : undefined}
            onClick={() => onNavigate(view)}
        >
            <Icon name={icon} />
            {label}
        </button>
    )
    return (
        <nav className="app-confignav" aria-label="Configuration">
            <span className="app-confignav__title">Configuration</span>
            <div className="app-segment">{item('settings', 'Properties', 'sliders')}</div>
            {/* A configuration list opens in the platform, for example:
            <a className="app-link app-confignav__ext" href="/x_starter_provider_list.do" target="_blank" rel="noopener noreferrer" aria-label="Providers (opens in a new window)">
                <Icon name="plug" />
                Providers ↗
            </a> */}
            <span className="app-muted app-confignav__note">Visible to {APP_NAME} admins only.</span>
        </nav>
    )
}
