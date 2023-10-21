import fastify from 'fastify'
import cookie from '@fastify/cookie'
import crypto from 'node:crypto'
import { knex } from './database'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (req, rep) => {
  console.log(`[${req.method}] ${req.url}`)
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
