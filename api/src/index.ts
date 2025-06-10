import { Hono } from 'hono'
import brawlhallaRoute from './routes/brawlhalla'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Welcome to the dair.gg api!')
})

app.route('/brawlhalla', brawlhallaRoute)

export default app
