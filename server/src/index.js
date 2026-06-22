import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import ordersRouter from './routes/orders.js'
import qrRouter from './routes/qr.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API is running!' })
})

app.use('/api/orders', ordersRouter)
app.use('/api/qr', qrRouter)

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})