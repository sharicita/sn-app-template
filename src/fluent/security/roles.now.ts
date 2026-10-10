import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

// Two roles minimum: one to use the app, one to configure it. Platform admin passes every check.
export const appUser = Role({
    name: 'x_starter.user',
    description: 'Can use the app',
})

export const appAdmin = Role({
    name: 'x_starter.admin',
    description: 'App administrator - can also change the app configuration (Properties)',
    containsRoles: [appUser],
})
