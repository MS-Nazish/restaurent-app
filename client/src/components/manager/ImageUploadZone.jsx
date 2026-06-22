import { useState } from 'react'
import { supabase } from '../../lib/supabase'

function ImageUploadZone({ value, onChange }) {
  const [preview, setPreview] = useState(value || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setError(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.' + fileExt

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName)
      onChange(data.publicUrl)
    } catch (err) {
      setError(err.message)
      setPreview(value || null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onChange(null)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white text-gray-600 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-gray-100"
          >
            x
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
              Uploading...
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <span className="text-sm text-gray-500">
            {uploading ? 'Uploading...' : 'Click to upload an image'}
          </span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to a few MB</span>
        </label>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default ImageUploadZone
