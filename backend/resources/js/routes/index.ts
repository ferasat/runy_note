import { createRoute } from './helpers';

export const home = createRoute('home', '/');
export const dashboard = createRoute('dashboard', '/dashboard');
export const login = createRoute('login', '/login');
export const register = createRoute('register', '/register');
export const logout = createRoute('logout', '/logout', 'post');
