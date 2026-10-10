import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import appPage from '../../client/index.html'

// Opens at /x_starter_app.do. Keep package.json "servicenowApp.pageSuffix" ("_app.do") in step:
// the guided setup uses it to link to the installed app.
export const starterPage = UiPage({
    $id: Now.ID['app-page'],
    endpoint: 'x_starter_app.do',
    description: 'Starter App - main page (React)',
    category: 'general',
    html: appPage,
    direct: true,
})
