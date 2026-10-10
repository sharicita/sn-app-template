/** Every view has a deep link (?view=…&id=…), so pages open in new windows and can be bookmarked. */
export type ViewName = 'home' | 'settings'

export const APP_NAME = 'Starter App'
export const APP_DESCRIPTION = 'A starter ServiceNow scoped app: replace this with a one-line description of what your app does.'

export interface ViewState {
    view: ViewName
    id: string | null
}

const VIEWS: ViewName[] = ['home', 'settings']

export function getViewFromUrl(): ViewState {
    const params = new URLSearchParams(window.location.search)
    const v = params.get('view') as ViewName
    return { view: VIEWS.indexOf(v) >= 0 ? v : 'home', id: params.get('id') }
}

function fireTop(relativePath: string, title: string) {
    if (window.self !== window.top) {
        const ce = (window as any).CustomEvent
        if (ce && typeof ce.fireTop === 'function') ce.fireTop('magellanNavigator.permalink.set', { relativePath, title })
    }
}

export function setTitle(title: string) {
    fireTop(window.location.pathname + window.location.search, title)
    document.title = title
}

/** Pushes a URLSearchParams route (works standalone and inside the Next Experience iframe). */
export function pushView(view: ViewName, id?: string | null, title = APP_NAME) {
    const params = new URLSearchParams({ view })
    if (id) params.set('id', id)
    const relativePath = `${window.location.pathname}?${params}`
    fireTop(relativePath, title)
    window.history.pushState({ view, id }, '', relativePath)
    document.title = title
}
