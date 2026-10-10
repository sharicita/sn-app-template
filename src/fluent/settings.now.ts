import '@servicenow/sdk/global'
import { Property } from '@servicenow/sdk/core'

// ---- application properties (managed in the app under Configuration > Properties) ------------
// App configuration is visible to and changeable by app admins only (and admin, which passes
// every role check). Server code still reads the values for everyone through gs.getProperty.
// Add each new property to src/server/admin/settings.ts and to docs/data-dictionary.md.
const ADMIN = ['x_starter.admin']

Property({
    $id: Now.ID['prop-ui-instance-theme'],
    name: 'x_starter.ui.instance_theme',
    type: 'boolean',
    value: 'false',
    description: "Follow each user's own ServiceNow (Next Experience) theme, including dark appearance, instead of the app's fixed colours. Status colours stay the same.",
    roles: { read: ADMIN, write: ADMIN },
})

Property({
    $id: Now.ID['prop-example-limit'],
    name: 'x_starter.search.limit',
    type: 'integer',
    value: '20',
    description: 'Example setting: the most records a search returns (1-100). Replace or remove it.',
    roles: { read: ADMIN, write: ADMIN },
})
