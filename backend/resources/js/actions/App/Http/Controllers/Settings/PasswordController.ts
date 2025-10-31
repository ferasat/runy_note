import { createRoute } from '@/routes/helpers';

const PasswordController = {
    edit: createRoute('user-password.edit', '/settings/password'),
    update: createRoute(
        'user-password.update',
        '/settings/password',
        'put',
    ),
};

export default PasswordController;
