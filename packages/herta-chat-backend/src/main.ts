import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { node } from '@elysiajs/node';
import fs from 'node:fs/promises';
import path from 'node:path';
const dirname = import.meta.dirname as string;
const filename = import.meta.filename as string;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER_FILES: string;
      TOKEN: string;
    }
  }
}

const tokens = process.env.TOKEN.split(',');
const files = new Map<string, string>();
for (const token of tokens) {
  files.set(token, path.join(dirname, '..', process.env.USER_FILES, token));
}
await fs.mkdir(path.join(dirname, '..', process.env.USER_FILES), {
  recursive: true
});
files.forEach(async (file) => {
  try {
    await fs.access(file);
  } catch (e) {
    fs.writeFile(
      file,
      JSON.stringify({
        apiKey: '',
        rooms: []
      })
    );
  }
});

new Elysia({ adapter: node() })
  .use(cors())
  .get('/', (ctx) => {
    ctx.redirect('https://herta-chat.sharpdotnut.com/');
  })
  .get('/api/', (ctx) => {
    return {
      message: 'Hello World'
    };
  })
  .group('/api', (app) =>
    app
      .onBeforeHandle(async (ctx) => {
        const userToken = process.env.TOKEN;
        if (
          !ctx.headers.authorization ||
          !tokens.includes(ctx.headers.authorization)
        ) {
          ctx.set.status = 401;
          return {
            status: 401,
            body: {
              message: ['Unauthorized', userToken, ctx.headers.authorization]
            }
          };
        }
      })
      .get(
        '/sync',
        async (ctx) => {
          try {
            return JSON.parse(
              await fs.readFile(files.get(ctx.headers.authorization)!, 'utf-8')
            );
          } catch (e) {
            ctx.set.status = 500;
            return 'Error';
          }
        },
        {
          headers: t.Object({
            authorization: t.String()
          })
        }
      )
      .post(
        '/sync',
        async (ctx) => {
          try {
            await fs.writeFile(
              files.get(ctx.headers.authorization)!,
              JSON.stringify(ctx.body)
            );
            return 'ok';
          } catch (e) {
            ctx.set.status = 500;
            return 'Error';
          }
        },
        {
          headers: t.Object({
            authorization: t.String()
          }),
          body: t.Object({
            apiKey: t.String(),
            rooms: t.Array(t.Any())
          })
        }
      )
  )
  .listen(3000);

console.log(`Listening on http://localhost:3000`);
