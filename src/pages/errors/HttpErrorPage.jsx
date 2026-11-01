import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  FileQuestion,
  AlertTriangle,
  ServerCrash,
  Clock,
  ArrowLeft,
  Home,
  RefreshCw
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HttpErrorPage({
  code = 404,
  title,
  message,
  actionText,
  actionLink,
  showRetry = false,
  onRetry
}) {
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch {
    navigate = (delta) => {
      if (typeof delta === 'number') window.history.go(delta);
      else window.location.href = delta;
    };
  }

  let role = null;
  let session = null;
  try {
    const academic = useAcademic();
    if (academic) {
      role = academic.role;
      session = academic.session;
    }
  } catch {
    // Rendered outside AcademicProvider
  }

  const getDashboardPath = () => {
    if (!session) return '/login';
    if (role === 'admin') return '/admin/admin';
    if (role === 'faculty') return '/faculty/roster';
    return '/student/overview';
  };

  const errorConfigs = {
    400: {
      icon: AlertTriangle,
      color: 'amber',
      defaultTitle: '400 — Bad Request',
      defaultMessage: 'The institutional request was malformed or could not be processed. Please verify submitted academic data.'
    },
    401: {
      icon: Lock,
      color: 'sky',
      defaultTitle: '401 — Authentication Required',
      defaultMessage: 'Your academic session has expired or requires institutional credentials. Please sign in to continue.'
    },
    403: {
      icon: ShieldAlert,
      color: 'rose',
      defaultTitle: '403 — Access Forbidden',
      defaultMessage: 'Access Denied: You do not possess the required institutional authorization to access this portal or resource.'
    },
    404: {
      icon: FileQuestion,
      color: 'slate',
      defaultTitle: '404 — Record / Page Not Found',
      defaultMessage: 'The requested academic endpoint or student record does not exist or has been relocated by college administration.'
    },
    409: {
      icon: AlertTriangle,
      color: 'amber',
      defaultTitle: '409 — Resource Conflict',
      defaultMessage: 'A conflicting record or duplicate attendance submission was detected. Please verify current database status.'
    },
    429: {
      icon: Clock,
      color: 'purple',
      defaultTitle: '429 — Rate Limit Exceeded',
      defaultMessage: 'Too many requests were received in a short duration. Automated anti-abuse throttling is active.'
    },
    500: {
      icon: ServerCrash,
      color: 'rose',
      defaultTitle: '500 — Server Processing Error',
      defaultMessage: 'An unexpected institutional service error occurred while communicating with the database.'
    },
    503: {
      icon: ServerCrash,
      color: 'amber',
      defaultTitle: '503 — Academic Service Unavailable',
      defaultMessage: 'The college attendance gateway is temporarily undergoing routine maintenance. Please retry shortly.'
    }
  };

  const config = errorConfigs[code] || errorConfigs[404];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const colorStyles = {
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      iconBg: 'bg-sky-100 text-sky-600',
      badge: 'bg-sky-100 text-sky-800 border-sky-300'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100 text-purple-600',
      badge: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      badge: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }[config.color];

  const isServerError = code >= 500;
  const illustrationSrc = isServerError ? '/illustrations/error_server.jpg' : '/illustrations/error_404.jpg';

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top University Incident Banner */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Icon className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              University Attendance Gateway
            </span>
            <span className="text-[11px] text-slate-400">
              Diagnostic &amp; Error Recovery Center
            </span>
          </div>
        </div>

        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/80">
          HTTP {code}
        </span>
      </header>

      {/* Center Full-Screen Error Stage */}
      <main className="my-auto py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              System Gateway Exception
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {displayTitle}
            </h1>
          </div>
        </div>

        {/* Detailed Diagnostic Terminal Box */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 font-mono text-xs text-slate-300 space-y-3 shadow-2xl overflow-x-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
              Exception Trace &amp; Diagnostic Log
            </span>
            <span>Error Status: {code}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-sm">
            {displayMessage}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {showRetry && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again / Reload</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to={actionLink || getDashboardPath()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{actionText || (session ? 'My Dashboard' : 'Sign In Gateway')}</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>University Attendance Suite • Secure Incident Logged</span>
        <span className="font-mono">Timestamp: {new Date().toISOString()}</span>
      </footer>
    </div>
  );
}
