import { createRoute } from '../helpers';

export const store = createRoute(
    'password.confirm',
    '/confirm-password',
    'post',
);
