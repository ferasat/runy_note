import { createRoute } from '@/routes/helpers';

const ProfileController = {
    edit: createRoute('profile.edit', '/settings/profile'),
    update: createRoute('profile.update', '/settings/profile', 'patch'),
    destroy: createRoute(
        'profile.destroy',
        '/settings/profile',
        'delete',
    ),
};

export default ProfileController;
