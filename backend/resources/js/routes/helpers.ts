import type { Method, UrlMethodPair } from '@inertiajs/core';

type HttpMethod = Lowercase<Method>;

type RouteParams = Record<string, string | number | boolean | null | undefined>;

type FormOptions = {
    params?: RouteParams;
    method?: HttpMethod;
};

type RouteHelper = {
    (params?: RouteParams): UrlMethodPair;
    readonly method: HttpMethod;
    readonly name: string;
    url: (params?: RouteParams) => string;
    href: (params?: RouteParams) => UrlMethodPair;
    form: (options?: FormOptions) => { method: HttpMethod; action: UrlMethodPair };
    toString: () => string;
};

declare global {
    // Ziggy adds a global `route` helper when available.
    // eslint-disable-next-line no-var
    var route: undefined | ((name: string, params?: RouteParams) => string);
}

const PARAM_PATTERN = /:([a-zA-Z0-9_]+)/g;

const interpolateParams = (template: string, params?: RouteParams): string => {
    if (!params) {
        return template;
    }

    return template.replace(PARAM_PATTERN, (_, key) => {
        const value = params[key];
        return value === undefined || value === null
            ? ''
            : encodeURIComponent(String(value));
    });
};

const resolveUrl = (
    name: string,
    fallback: string,
    params?: RouteParams,
): string => {
    try {
        if (typeof globalThis.route === 'function') {
            return globalThis.route(name, params as Record<string, unknown>);
        }
    } catch (error) {
        console.warn(
            `Failed to resolve Ziggy route \"${name}\". Falling back to the provided URL.`,
            error,
        );
    }

    return interpolateParams(fallback, params);
};

export const createRoute = (
    name: string,
    fallback: string,
    method: HttpMethod = 'get',
): RouteHelper => {
    const pair = (params?: RouteParams, override?: HttpMethod): UrlMethodPair => ({
        url: resolveUrl(name, fallback, params),
        method: ((override ?? method) as Method),
    });

    const routeFn = ((params?: RouteParams) => pair(params)) as RouteHelper;

    Object.defineProperty(routeFn, 'name', { value: name, enumerable: true });
    Object.defineProperty(routeFn, 'method', { value: method, enumerable: true });

    routeFn.url = (params?: RouteParams) => resolveUrl(name, fallback, params);
    routeFn.href = (params?: RouteParams) => pair(params);
    routeFn.form = (options?: FormOptions) => ({
        method: (options?.method ?? method) as HttpMethod,
        action: pair(options?.params, options?.method),
    });
    routeFn.toString = () => resolveUrl(name, fallback);

    return routeFn;
};

export type { HttpMethod, RouteHelper };
