import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

export default function QRPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)
  const [error, setError] = useState(null)
  const { session } = useAuthStore()

  useEffect(() => {
    fetchTables()
  }, [])

  async function fetchTables() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('id, table_number, qr_code_url')
        .order('table_number')

      if (error) throw error
      setTables(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateQR(tableId) {
    setGenerating(tableId)
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/qr/generate/' + tableId,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + session?.access_token,
          },
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate QR')

      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, qr_code_url: data.qr_code_url } : t
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(null)
    }
  }

  async function downloadQR(url, tableNumber) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'QR-Table-' + tableNumber + '.png'
      link.click()
    } catch (err) {
      setError('Download failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading tables...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">QR Codes</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate and download QR codes for each table
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {tables.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No tables found. Add tables in Supabase first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center gap-4"
              >
                <h2 className="text-base font-semibold text-slate-800">
                  Table {table.table_number}
                </h2>

                {table.qr_code_url ? (
                  <img
                    src={table.qr_code_url}
                    alt={'QR code for Table ' + table.table_number}
                    className="w-40 h-40 object-contain border border-slate-100 rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-slate-400 text-center px-2">
                      No QR generated yet
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => generateQR(table.id)}
                    disabled={generating === table.id}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    {generating === table.id
                      ? 'Generating...'
                      : table.qr_code_url
                      ? 'Regenerate QR'
                      : 'Generate QR'}
                  </button>

                  {table.qr_code_url && (
                    <button
                      onClick={() => downloadQR(table.qr_code_url, table.table_number)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Download PNG
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 text-center break-all">
                  {import.meta.env.VITE_API_URL?.replace(':4000', ':5173')}/menu/{table.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
