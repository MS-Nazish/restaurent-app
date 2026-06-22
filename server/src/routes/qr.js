import express from 'express'
import QRCode from 'qrcode'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

router.post('/generate/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const menuUrl = frontendUrl + '/menu/' + tableId

    const qrBuffer = await QRCode.toBuffer(menuUrl, {
      type: 'png',
      width: 400,
      margin: 2,
    })

    const fileName = 'table-' + tableId + '.png'
    const { error: uploadError } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(fileName, qrBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseAdmin.storage
      .from('qr-codes')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    const { error: updateError } = await supabaseAdmin
      .from('tables')
      .update({ qr_code_url: publicUrl })
      .eq('id', tableId)

    if (updateError) throw updateError

    res.json({ success: true, qr_code_url: publicUrl })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router