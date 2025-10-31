import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { classicLogin, classicRegister, eitaaLogin } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  password_confirmation: ''
};

export default function LoginPage() {
  const { setToken, setUser, token } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const attemptedAuto = useRef(false);

  useEffect(() => {
    if (token) {
      navigate('/notes', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const sdk = window.Eitaa?.WebApp;
    console.info('LoginPage SDK detection:', Boolean(sdk));
    if (!sdk || attemptedAuto.current) {
      return;
    }
    attemptedAuto.current = true;

    if (!sdk.initData) {
      return;
    }

    const params = new URLSearchParams(sdk.initData);
    const hash = params.get('hash');
    const user = params.get('user');

    if (!hash || !user) {
      console.warn('Eitaa init data missing hash or user parameter');
      return;
    }

    const autoLogin = async () => {
      setLoading(true);
      try {
        const response = await eitaaLogin({ hash, user });
        applyAuth(response.data);
        show('ورود از طریق ایتا موفق بود', 'success');
        navigate('/notes', { replace: true });
      } catch (error) {
        console.error('Auto login failed', error);
        show(error.response?.data?.message ?? 'ورود خودکار ناموفق بود. لطفاً از فرم ورود استفاده کنید.', 'error');
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [navigate, show]);

  const applyAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await classicRegister(form);
        applyAuth(response.data);
        show('ثبت‌نام انجام شد', 'success');
      } else {
        const payload = form.email ? { email: form.email, password: form.password } : { username: form.username, password: form.password };
        const response = await classicLogin(payload);
        applyAuth(response.data);
        show('ورود موفقیت‌آمیز بود', 'success');
      }
      const redirectTo = location.state?.from?.pathname ?? '/notes';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Login error', error);
      show(error.response?.data?.message ?? 'خطایی رخ داد', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-12">
      <div className="rounded-3xl bg-white/90 p-8 text-right shadow-xl backdrop-blur dark:bg-slate-900/90">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">دفترچه یادداشت ایتا</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          اگر از داخل ایتا وارد شده‌اید، ورود خودکار انجام خواهد شد. در غیر این صورت می‌توانید از فرم زیر استفاده کنید.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-slate-500">نام کامل</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-500">ایمیل</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                placeholder="اختیاری"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">نام کاربری</label>
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                placeholder="در صورت عدم استفاده از ایمیل"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500">رمز عبور</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-slate-500">تکرار رمز</label>
              <input
                type="password"
                required
                value={form.password_confirmation}
                onChange={(event) => setForm((prev) => ({ ...prev, password_confirmation: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:opacity-70"
          >
            {mode === 'register' ? 'ثبت‌نام' : 'ورود'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
          {mode === 'register' ? (
            <button onClick={() => setMode('login')} className="text-blue-500 hover:text-blue-600">
              حساب دارید؟ وارد شوید.
            </button>
          ) : (
            <button onClick={() => setMode('register')} className="text-blue-500 hover:text-blue-600">
              حساب ندارید؟ ثبت‌نام کنید.
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
