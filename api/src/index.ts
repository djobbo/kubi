import { Hono } from 'hono'
import { v1Route } from './routes/v1'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Welcome to the dair.gg api!')
})

app.route('/v1', v1Route)

export default app
