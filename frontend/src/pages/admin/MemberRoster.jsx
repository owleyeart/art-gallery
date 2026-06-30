import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminButton from '../../components/admin/AdminButton.jsx'
import { Input } from '../../components/admin/FormField.jsx'

const COLUMNS = [
  { key: 'name',      label: 'Name' },
  { key: 'medium',    label: 'Medium' },
  { key: 'email',     label: 'Email' },
  { key: 'phone',     label: 'Phone' },
  { key: 'is_active', label: 'Active' },
]

function SortIcon({ dir }) {
  if (!dir) return <span className="text-gray-300 ml-1">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

function exportCsv(rows) {
  const headers = ['Name', 'Medium', 'Email', 'Phone', 'Active', 'Sort Order']
  const lines = rows.map(r => [
    r.name,
    r.medium || '',
    r.email || '',
    r.phone || '',
    r.is_active ? 'Yes' : 'No',
    r.sort_order ?? 0,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `member-roster-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function MemberRoster() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })

  useEffect(() => {
    supabase
      .from('artists')
      .select('id, name, medium, email, phone, is_active, sort_order, created_at')
      .order('sort_order')
      .order('name')
      .then(({ data }) => {
        setArtists(data || [])
        setLoading(false)
      })
  }, [])

  function toggleSort(key) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const filtered = useMemo(() => {
    let rows = artists.filter(a => {
      const q = search.toLowerCase()
      const matchSearch = !q || [a.name, a.medium, a.email, a.phone].some(v => v?.toLowerCase().includes(q))
      const matchActive = filterActive === 'all' || (filterActive === 'active' ? a.is_active : !a.is_active)
      return matchSearch && matchActive
    })

    rows = [...rows].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (sort.key === 'is_active') { av = av ? 1 : 0; bv = bv ? 1 : 0 }
      else { av = (av || '').toString().toLowerCase(); bv = (bv || '').toString().toLowerCase() }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [artists, search, filterActive, sort])

  const activeCount = artists.filter(a => a.is_active).length

  if (loading) return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Member Roster</h1>
      <div className="animate-pulse text-sm text-gray-400">Loading…</div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Member Roster</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount} active · {artists.length} total members
          </p>
        </div>
        <AdminButton
          variant="ghost"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV ({filtered.length})
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, medium, email…"
          className="max-w-xs"
        />
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All members</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 cursor-pointer select-none hover:text-gray-800 whitespace-nowrap"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  <SortIcon dir={sort.key === col.key ? sort.dir : null} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(artist => (
              <tr key={artist.id} className={`hover:bg-gray-50 transition-colors ${!artist.is_active ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 font-medium">{artist.name}</td>
                <td className="px-4 py-3 text-gray-500">{artist.medium || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  {artist.email
                    ? <a href={`mailto:${artist.email}`} className="text-secondary hover:underline">{artist.email}</a>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {artist.phone || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${artist.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {artist.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">
            {artists.length === 0 ? 'No members yet.' : 'No results match your filter.'}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Roster reflects current Artists data. To edit member details, use{' '}
        <a href="/admin/artists" className="text-secondary hover:underline">Artists</a>.
      </p>
    </div>
  )
}
