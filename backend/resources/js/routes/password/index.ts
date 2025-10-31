import { createRoute } from '../helpers';

export const request = createRoute('password.request', '/forgot-password');
export const email = createRoute('password.email', '/forgot-password', 'post');
export const update = createRoute('password.update', '/reset-password', 'post');
