import { createRoute } from './helpers';

export const edit = createRoute('profile.edit', '/settings/profile');
export const update = createRoute('profile.update', '/settings/profile', 'patch');
export const destroy = createRoute('profile.destroy', '/settings/profile', 'delete');
