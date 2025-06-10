import { Hono } from 'hono'
import brawlhallaRoute from './routes/brawlhalla'
import { authRoute } from './routes/auth'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Welcome to the dair.gg api!')
})

app.route('/brawlhalla', brawlhallaRoute)
app.route('/auth', authRoute)

export default app
