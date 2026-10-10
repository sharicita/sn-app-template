import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { getMe, getSearch, getSettingsRoute, putSettingsRoute } from '../../server/rest/handlers'

// Base path: /api/x_starter/app
// Every handler checks for the x_starter.user role; admin routes also check x_starter.admin (403).
RestApi({
    $id: Now.ID['app-api'],
    name: 'Starter App',
    serviceId: 'app',
    shortDescription: 'Starter App REST API',
    consumes: 'application/json',
    produces: 'application/json',
    routes: [
        { $id: Now.ID['app-api-me'], name: 'Current user capabilities', method: 'GET', path: '/me', script: getMe },
        {
            $id: Now.ID['app-api-search'],
            name: 'Search groups (example)',
            method: 'GET',
            path: '/search',
            script: getSearch,
            parameters: [{ $id: Now.ID['app-api-search-q'], name: 'q', exampleValue: 'service' }],
        },
        { $id: Now.ID['app-api-settings-get'], name: 'Get settings (admin)', method: 'GET', path: '/admin/settings', script: getSettingsRoute },
        { $id: Now.ID['app-api-settings-put'], name: 'Save settings (admin)', method: 'PUT', path: '/admin/settings', script: putSettingsRoute },
    ],
})
