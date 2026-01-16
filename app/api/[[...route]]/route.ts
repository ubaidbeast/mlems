import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import accounts from "./accounts"
import { HTTPException } from 'hono/http-exception'

const app = new Hono().basePath('/api')

app.onError((err, c) => {
  if(err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({error: "Internal Error"}, 500)
})

const routes = app
  .route("/accounts", accounts)

export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;