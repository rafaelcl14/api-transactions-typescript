/* eslint-disable prettier/prettier */
import { expect, beforeAll, afterAll, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../app'

describe('Rotas de transactions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('O Usuario deve poder criar uma nova transacão', async () => {
    await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })
    .expect(201)
  })

  it('O usuario deve poder obter um resumo da sua conta', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTrasactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTrasactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })

  it('o usuario deve poder visualizar uma transacão unica', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTrasactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTrasactionsResponse.body.transactions[0].id

    const getTrasactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)


    expect(getTrasactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  
  it('O usuario deve poder obter um resumo da sua conta', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New transaction',
        amount: 2000,
        type: 'debit',
      })

    const symmaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(symmaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })

})
