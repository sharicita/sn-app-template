import { gs } from '@servicenow/glide'
import { rankedSearch } from '../lib/search.ts'
import { getSettings, instanceTheme, saveSettings, searchLimit, userTheme } from '../admin/settings.ts'

const USER_ROLE = 'x_starter.user'
const ADMIN_ROLE = 'x_starter.admin'

function qp(request: any, name: string): string {
    const v = request.queryParams ? request.queryParams[name] : undefined
    if (v === undefined || v === null) return ''
    return String(Array.isArray(v) ? v[0] : v)
}

function body(request: any): any {
    try {
        return request.body && request.body.data ? request.body.data : {}
    } catch (e) {
        return {}
    }
}

/** Admin rules are enforced here (403), not only by hiding the UI. Platform admin passes. */
function requireAdmin() {
    if (gs.hasRole(ADMIN_ROLE)) return
    // a status property instead of an Error subclass: instanceof is unreliable after transpiling
    const e: any = new Error(`The ${ADMIN_ROLE} role is required`)
    e.status = 403
    throw e
}

/** Runs a handler with the app role check and consistent JSON error responses. */
function handle(request: any, response: any, fn: (request: any) => unknown) {
    if (!gs.hasRole(USER_ROLE)) {
        response.setStatus(403)
        response.setBody({ error: { message: `The ${USER_ROLE} role is required to use this app` } })
        return
    }
    try {
        const result = fn(request)
        response.setStatus(200)
        // the platform wraps the body in { result: ... }
        response.setBody(result as any)
    } catch (e: any) {
        const message = e && e.message ? e.message : String(e)
        response.setStatus(e && e.status === 403 ? 403 : message.indexOf('not found') >= 0 ? 404 : 400)
        response.setBody({ error: { message } })
    }
}

export function getMe(request: any, response: any) {
    handle(request, response, () => ({
        user: gs.getUserName(),
        is_admin: gs.hasRole(ADMIN_ROLE),
        instance_theme: instanceTheme(),
        theme: userTheme(),
    }))
}

/** Example search: only groups the signed-in user can read (GlideRecordSecure), ranked. */
export function getSearch(request: any, response: any) {
    handle(request, response, (req) =>
        rankedSearch(
            { table: 'sys_user_group', fields: ['name', 'description'], text: qp(req, 'q'), limit: searchLimit(), secure: true, orderBy: 'name', baseQuery: 'active=true' },
            (r) => ({ sys_id: r.getUniqueValue(), name: r.getValue('name'), description: r.getValue('description') || '', email: r.getValue('email') || '' })
        )
    )
}

export function getSettingsRoute(request: any, response: any) {
    handle(request, response, () => {
        requireAdmin()
        return getSettings()
    })
}

export function putSettingsRoute(request: any, response: any) {
    handle(request, response, (req) => {
        requireAdmin()
        return saveSettings(body(req))
    })
}
