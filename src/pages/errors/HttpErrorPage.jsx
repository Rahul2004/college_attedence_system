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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dynamic High-End Error Illustration Banner */}
        <div className="w-full h-48 sm:h-56 bg-slate-100 relative overflow-hidden border-b border-slate-100">
          <img 
            src={illustrationSrc} 
            alt={`Error ${code} illustration`} 
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
          
          {/* Floating HTTP Code Pill */}
          <div className="absolute top-4 right-4">
            <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md bg-white/90 ${colorStyles.badge}`}>
              HTTP Status {code}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-4 text-center">
          {/* Error Icon Badge */}
          <div className={`w-12 h-12 rounded-2xl ${colorStyles.iconBg} flex items-center justify-center mx-auto mb-3 shadow-xs border ${colorStyles.border}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display mb-2">
            {displayTitle}
          </h1>

          {/* Explanation */}
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {displayMessage}
          </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 border-t border-outline">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sk-btn bg-surface-sunken hover:bg-slate-200 text-ink text-xs font-bold transition border border-outline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>

          {showRetry && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sk-btn bg-sky hover:bg-sky-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}

          <Link
            to={actionLink || getDashboardPath()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sk-btn bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            {actionText || (session ? 'My Dashboard' : 'Sign In')}
          </Link>
        </div>

        {/* Security Note Footer */}
        <div className="mt-6 pt-4 border-t border-outline text-[11px] text-ink-subtle">
          University Attendance Suite • Secure Access Gateway • Incident Logged
        </div>
      </div>
      </div>
    </div>
  );
}
