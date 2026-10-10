import React from 'react'
import { APP_DESCRIPTION, APP_NAME, ViewName } from '../utils/nav'
import Icon from './Icon'

interface Props {
    view: ViewName
    isAdmin: boolean
    onNavigate: (v: ViewName) => void
}

const ICON: { [v: string]: string } = { home: 'home', settings: 'settings' }

export default function Header({ view, isAdmin, onNavigate }: Props) {
    // every Configuration page sits under the Settings tab
    const active = (name: ViewName) => view === name
    const tab = (name: ViewName, label: string, tipText: string) => (
        <button
            data-tip={tipText}
            type="button"
            className={`app-tab${active(name) ? ' app-tab--active' : ''}`}
            aria-current={active(name) ? 'page' : undefined}
            onClick={() => onNavigate(name)}
        >
            <Icon name={ICON[name]} />
            {label}
        </button>
    )
    return (
        <header className="app-header">
            <div className="app-header__brand">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
                </svg>
                <div>
                    <h1 className="app-header__title">
                        <a
                            className="app-header__home"
                            href="?view=home"
                            onClick={(e) => {
                                // in-app navigation; ctrl/cmd-click still opens a new tab
                                if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return
                                e.preventDefault()
                                onNavigate('home')
                            }}
                        >
                            {APP_NAME}
                        </a>
                    </h1>
                    <p className="app-header__sub">{APP_DESCRIPTION}</p>
                </div>
            </div>
            <nav className="app-header__tabs" aria-label={`${APP_NAME} views`}>
                {tab('home', 'Home', 'The main page of the app.')}
                {isAdmin && tab('settings', 'Settings', 'Admin configuration: properties.')}
            </nav>
        </header>
    )
}
