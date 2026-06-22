import { supabase } from './supabase'

async function uploadImage(file) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = 'item-' + Date.now() + '.' + fileExt
    const filePath = 'menu-items/' + fileName

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (err) {
    console.error('Image upload error:', err)
    throw err
  }
}

export default uploadImage