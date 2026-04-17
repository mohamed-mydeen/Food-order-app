const roleMeta = {
  developer: { label: 'Developer', emoji: '🔴', color: 'from-red-500 to-rose-600' },
  admin:     { label: 'Admin',     emoji: '🟠', color: 'from-orange-400 to-orange-600' },
  delivery:  { label: 'Delivery',  emoji: '🚚', color: 'from-blue-400 to-blue-600' },
  user:      { label: 'User',      emoji: '👤', color: 'from-slate-400 to-slate-600' },
}

const roleAccess = {
  developer: ['Dashboard', 'Products', 'Orders', 'Billing', 'Users', 'Offers', 'Analytics', 'Bug Reports'],
  admin:     ['Dashboard', 'Products', 'Orders', 'Billing', 'Users', 'Offers'],
  delivery:  ['Orders', 'Billing'],
}

export default function AccessDenied({ requiredRoles = [], userRole }) {
  const meta = roleMeta[userRole] || { label: 'Unknown', emoji: '❓', color: 'from-slate-400 to-slate-600' }
  const access = roleAccess[userRole] || []

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Icon */}
      <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        This page requires <span className="font-semibold">{requiredRoles.join(' or ')}</span> access.
        Your current role does not have permission to view this page.
      </p>

      {/* Current role badge */}
      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${meta.color} text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg`}>
        <span>{meta.emoji}</span>
        <span>You are logged in as: {meta.label}</span>
      </div>

      {/* What you CAN access */}
      {access.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm w-full text-left">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">Your accessible pages</p>
          <div className="flex flex-wrap gap-2">
            {access.map(page => (
              <span key={page} className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                {page}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
