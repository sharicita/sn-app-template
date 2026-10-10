import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { appUser } from '../security/roles.now'

const PAGE = 'x_starter_app.do'

export const appMenu = ApplicationMenu({
    $id: Now.ID['app-menu'],
    title: 'Starter App',
    hint: 'Starter App',
    description: 'Starter App modules',
    roles: [appUser],
    active: true,
})

// ---- main modules first -----------------------------------------------------
Record({
    $id: Now.ID['app-module-home'],
    table: 'sys_app_module',
    data: {
        title: 'Home',
        application: appMenu,
        link_type: 'DIRECT',
        query: PAGE,
        hint: 'Open the app',
        roles: ['x_starter.user'],
        active: true,
        order: 100,
    },
})

// ---- Configuration (app admins and admin only) ------------------------------
// Everything that configures the app lives under this separator. Properties comes first, then
// integrations, then provider / configuration lists.
const CONFIG_ROLES = ['x_starter.admin', 'admin']

Record({
    $id: Now.ID['app-module-config-separator'],
    table: 'sys_app_module',
    data: {
        title: 'Configuration',
        application: appMenu,
        link_type: 'SEPARATOR',
        hint: 'App configuration (app admins)',
        roles: CONFIG_ROLES,
        active: true,
        order: 1000,
    },
})

Record({
    $id: Now.ID['app-module-properties'],
    table: 'sys_app_module',
    data: {
        title: 'Properties',
        application: appMenu,
        link_type: 'DIRECT',
        query: `${PAGE}?view=settings`,
        hint: 'App settings',
        roles: CONFIG_ROLES,
        active: true,
        order: 1100,
    },
})
