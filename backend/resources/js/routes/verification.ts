import { createRoute } from './helpers';

export const send = createRoute(
    'verification.send',
    '/email/verification-notification',
    'post',
);
