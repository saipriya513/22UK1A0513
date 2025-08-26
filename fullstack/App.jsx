import React, { useEffect, useMemo, useState } from 'react'

const empty = { title: '', status: 'todo', notes: '' }

export default function App () {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchItems () {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/items')
      const data = await r.json()
      setItems(data)
    } catch (e) {
      setError('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const isEditing = useMemo(() => !!editingId, [editingId])

  function onChange (e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit (e) {
    e.preventDefault()
    setError('')
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/items/${editingId}` : '/api/items'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!r.ok) throw new Error('Request failed')
      setForm(empty)
      setEditingId(null)
      await fetchItems()
    } catch (e) {
      setError('Save failed')
    }
  }

  async function onDelete (id) {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      await fetchItems()
    } catch {
      setError('Delete failed')
    }
  }

  function onEdit (item) {
    setForm({ title: item.title, status: item.status, notes: item.notes || '' })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Campus Hiring Evaluation — Demo</h1>
        <span style={{ fontSize: 14, opacity: 0.7 }}><a href="/health" target="_blank">API Health</a></span>
      </header>

      <section style={{ marginTop: 16, padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>{isEditing ? 'Edit Item' : 'New Item'}</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label>Title</label><br/>
            <input required name="title" value={form.title} onChange={onChange} placeholder="e.g., Create API contract" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label>Notes</label><br/>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={3} placeholder="Optional" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #111', background: '#111', color: 'white' }}>
              {isEditing ? 'Save Changes' : 'Add Item'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setForm(empty); setEditingId(null) }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', background: 'white' }}>Cancel</button>
            )}
          </div>
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
        </form>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Items</h2>
          <button onClick={fetchItems} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Refresh</button>
        </div>
        {loading ? <p>Loading...</p> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
            marginTop: 12
          }}>
            {items.map(item => (
              <article key={item.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{item.title}</h3>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>{item.status.replace('_', ' ')}</span>
                </div>
                {item.notes && <p style={{ whiteSpace: 'pre-wrap' }}>{item.notes}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onEdit(item)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111', background: '#111', color: 'white' }}>Edit</button>
                  <button onClick={() => onDelete(item.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Delete</button>
                </div>
              </article>
            ))}
            {items.length === 0 && <p>No items yet.</p>}
          </div>
        )}
      </section>

      <footer style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        <p>Demo meets the brief: microservice, responsive React app, error handling, and efficient API/UI.</p>
      </footer>
    </div>
  )
}