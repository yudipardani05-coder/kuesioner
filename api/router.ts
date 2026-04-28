import { createRouter, publicQuery } from "./middleware";
import { kuesionerRouter } from "./kuesionerRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  kuesioner: kuesionerRouter,
});

export type AppRouter = typeof appRouter;
