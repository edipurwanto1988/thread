import { defineMiddleware } from 'astro:middleware';
import { currentUser } from './lib/auth';

const protectedRoutes = ['/dashboard', '/generator', '/drafts', '/settings', '/logs'];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtected) {
    const user = await currentUser(context.cookies);
    if (!user) {
      return context.redirect('/login');
    }
    context.locals.user = user;
  }

  return next();
});
