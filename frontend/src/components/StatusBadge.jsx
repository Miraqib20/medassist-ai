import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    Rejected: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
};
