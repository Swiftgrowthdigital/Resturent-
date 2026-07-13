import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export function ErrorScreen({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-10">
      <div className="premium-card w-full p-6 text-center sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-200">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
          {description || 'We hit an unexpected problem, but the app can recover safely.'}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" leftIcon={RefreshCw} onClick={onRetry}>
            Retry
          </Button>
          <Button as={Link} to="/menu" leftIcon={Home}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
