import { createRoute } from '../helpers';

export const show = createRoute('two-factor.show', '/settings/two-factor');
export const enable = createRoute(
    'two-factor.enable',
    '/user/two-factor-authentication',
    'post',
);
export const disable = createRoute(
    'two-factor.disable',
    '/user/two-factor-authentication',
    'delete',
);
export const confirm = createRoute(
    'two-factor.confirm',
    '/user/confirmed-two-factor-authentication',
    'post',
);
export const qrCode = createRoute(
    'two-factor.qr-code',
    '/user/two-factor-qr-code',
);
export const secretKey = createRoute(
    'two-factor.secret-key',
    '/user/two-factor-secret-key',
);
export const recoveryCodes = createRoute(
    'two-factor.recovery-codes',
    '/user/two-factor-recovery-codes',
);
export const regenerateRecoveryCodes = createRoute(
    'two-factor.regenerate-recovery-codes',
    '/user/two-factor-recovery-codes',
    'post',
);
