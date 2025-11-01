import { createRoute } from './helpers';

export const edit = createRoute('user-password.edit', '/settings/password');
export const update = createRoute(
    'user-password.update',
    '/settings/password',
    'put',
);
