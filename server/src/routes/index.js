import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import qrRouter from './routes/qr.js'
import menuRouter from './routes/menu.js'
import reportsRouter from './routes/reports.js'
import ordersRouter from './routes/orders.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API is running!' })
})

app.use('/api/qr', qrRouter)
app.use('/api/menu', menuRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/orders', ordersRouter)

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})