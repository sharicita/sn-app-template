import React, { useEffect, useMemo, useState } from 'react'
import { Api, GroupRow } from '../services/Api'
import SortTh, { GroupedRows, ListBreadcrumb, useSort } from '../components/SortTh'
import ListActions from '../components/ListActions'
import SearchCombo from '../components/SearchCombo'
import RecordLink, { recordUrl } from '../components/RecordLink'
import HelpTip from '../components/HelpTip'
import DocLink from '../components/DocLink'
import Tip from '../components/Tip'
import Icon from '../components/Icon'
import { rankFilter } from '../utils/rank'
import { bySysIds } from '../utils/snList'
import { download, toCsv } from '../utils/download'

const PAGE = 50

/**
 * Example landing page: a ServiceNow-style list of groups the signed-in user can read, showing
 * every list-view behaviour from the build standards (sort, column menu, group by, right-click
 * filters, breadcrumb, personalize columns, text filter, Open list / Copy query / Export, paging).
 * Replace it with your app's own first page.
 */
export default function HomeView() {
    const [rows, setRows] = useState<GroupRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [q, setQ] = useState('')
    const [limit, setLimit] = useState(PAGE)

    useEffect(() => {
        Api.search('')
            .then(setRows)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    // the same ranked matching as every search box: starts-with first, then contains
    const filtered = useMemo(() => rankFilter(rows, q, (r) => [r.name, r.description, r.email]), [rows, q])
    const sorter = useSort(
        filtered,
        { name: (r) => r.name, description: (r) => r.description, email: (r) => r.email },
        { id: 'home-groups', required: ['name'], groupLabel: { email: (r) => r.email || '(empty)' } }
    )
    const on = (col: string, r: GroupRow) => ({ onContextMenu: sorter.cellMenu(col, r) })
    const show = sorter.shows
    const isFiltered = !!(q || sorter.filters.length)

    return (
        <div className="app-stack">
            <Tip id="home-intro">This is the starter's example page. Right-click a cell to show matching rows or filter them out; use a heading's ⋮ menu to sort or group.</Tip>

            <section className="app-card" aria-labelledby="home-find">
                <div className="app-card__header">
                    <h2 id="home-find">
                        <Icon name="search" /> Find a group
                    </h2>
                    <HelpTip label="What does this search?">
                        Active groups you can read, ranked: names that start with your text first, then descriptions that start with it, then anything that contains it.
                    </HelpTip>
                    <DocLink doc="acl" label="ServiceNow docs: how access rules decide what you can read" />
                </div>
                <div className="app-card__body">
                    <SearchCombo
                        label="Group"
                        placeholder="Type a group name…"
                        search={(text) => Api.search(text).then((list) => list.map((g) => ({ key: g.sys_id, primary: g.name, secondary: g.description })))}
                        onPick={(o) => window.open(recordUrl.group(o.key), '_blank', 'noopener')}
                        clearOnPick
                        emptyText="No groups match."
                    />
                </div>
            </section>

            <section className="app-card" aria-labelledby="home-list">
                <div className="app-card__header app-mx__toolbar">
                    <h2 id="home-list">
                        <Icon name="list" /> Groups
                    </h2>
                    <input className="app-input app-mx__search" placeholder="Filter by name, description or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter groups" />
                    {q && (
                        <button type="button" className="app-link" onClick={() => setQ('')}>
                            Clear filter
                        </button>
                    )}
                    {loading && <span className="app-muted">Loading…</span>}
                    <ListActions
                        list={bySysIds('sys_user_group', sorter.rows.map((r) => r.sys_id), `these ${sorter.rows.length} groups`)}
                        onExport={() => {
                            const out: unknown[][] = [['Name', 'Description', 'Email']]
                            for (const r of sorter.rows) out.push([r.name, r.description, r.email])
                            download('groups.csv', toCsv(out), 'text/csv;charset=utf-8')
                        }}
                        exportWhat={`the ${sorter.rows.length} groups listed${isFiltered ? ' (filtered)' : ''}`}
                        filtered={isFiltered}
                    />
                </div>
                {error && <div className="app-alert app-alert--critical">{error}</div>}
                <div className="app-mx__scroll">
                    <ListBreadcrumb sorter={sorter} noun="groups" limit={limit} />
                    <table className="app-mx app-mx--compact">
                        <caption className="app-sr">Groups you can read</caption>
                        <thead>
                            <tr>
                                <SortTh sorter={sorter} col="name">
                                    Name
                                </SortTh>
                                <SortTh sorter={sorter} col="description">
                                    Description
                                </SortTh>
                                <SortTh sorter={sorter} col="email">
                                    Email
                                </SortTh>
                            </tr>
                        </thead>
                        <tbody>
                            <GroupedRows
                                sorter={sorter}
                                colSpan={3}
                                limit={limit}
                                render={(r) => (
                                    <tr key={r.sys_id}>
                                        <th scope="row" {...on('name', r)}>
                                            {r.name} <RecordLink href={recordUrl.group(r.sys_id)} what={`group record for ${r.name}`} />
                                        </th>
                                        {show('description') && <td {...on('description', r)}>{r.description}</td>}
                                        {show('email') && <td {...on('email', r)}>{r.email}</td>}
                                    </tr>
                                )}
                            />
                        </tbody>
                    </table>
                    {sorter.rows.length > limit && (
                        <button type="button" className="app-btn app-btn--ghost" onClick={() => setLimit(limit + PAGE)}>
                            Show more
                        </button>
                    )}
                    {!loading && !sorter.rows.length && <p className="app-muted">{isFiltered ? 'No groups match the filter.' : 'No groups you can read.'}</p>}
                </div>
            </section>
        </div>
    )
}
