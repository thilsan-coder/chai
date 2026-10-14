import React from 'react';
import type { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    gold: 'bg-amber-400/15 text-amber-300 border-amber-400/40 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'preparing':
      return <Badge variant="info">Preparing</Badge>;
    case 'ready':
      return <Badge variant="gold">Ready for Pickup</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const OrderTypeBadge: React.FC<{ type: OrderType; table?: string }> = ({ type, table }) => {
  if (type === 'dine-in') {
    return (
      <Badge variant="gold" size="sm">
        Dine-in {table ? `• Table ${table}` : ''}
      </Badge>
    );
  }
  return (
    <Badge variant="default" size="sm">
      Takeaway
    </Badge>
  );
};

export const PaymentMethodBadge: React.FC<{ method: PaymentMethod; status?: PaymentStatus }> = ({
  method,
  status,
}) => {
  if (method === 'cash') {
    return <Badge variant="success" size="sm">Cash</Badge>;
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="info" size="sm">Bank Transfer</Badge>
      {status === 'pending' && <Badge variant="warning" size="sm">Verify</Badge>}
      {status === 'verified' && <Badge variant="success" size="sm">Verified</Badge>}
    </span>
  );
};
