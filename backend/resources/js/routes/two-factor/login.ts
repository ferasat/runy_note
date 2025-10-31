import { createRoute } from '../helpers';

export const store = createRoute(
    'two-factor.login',
    '/two-factor-challenge',
    'post',
);
