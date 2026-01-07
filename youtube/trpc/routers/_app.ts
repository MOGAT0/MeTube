import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { videoRouter } from '@/app/api/routers/video';

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
  
    video:videoRouter


});

// export type definition of API
export type AppRouter = typeof appRouter;
