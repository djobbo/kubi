import { Hono } from 'hono'
import { getRegion } from '../services/locate'
import { getIp } from '../helpers/get-ip'

const locateRoute = new Hono()

locateRoute.get('/region', async (c) => {
  const ip = getIp(c)

  if (!ip) {
    return c.json({ error: 'No IP address found' }, 400)
  }

  const region = await getRegion(ip)
  return c.json({ region })
})

export default locateRoute
