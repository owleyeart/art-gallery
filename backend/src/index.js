import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import artistsRouter from './routes/artists.js'
import eventsRouter from './routes/events.js'
import newsletterRouter from './routes/newsletter.js'
import siteConfigRouter from './routes/siteConfig.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/artists', artistsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/site-config', siteConfigRouter)

app.listen(PORT, () => {
  console.log(`Art Gallery API running on port ${PORT}`)
})
