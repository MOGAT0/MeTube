import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { videoRouter } from '@/app/api/routers/video';
import { playlistRouter } from '@/app/api/routers/playlist';

export const appRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `${opts.input.text}`,
      };
    }),
  
    video:videoRouter,

    playlist:playlistRouter

    


});

// export type definition of API
export type AppRouter = typeof appRouter;
