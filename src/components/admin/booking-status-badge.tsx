type BookingStatusBadgeProps = {
  status: "paid" | "pending" | "refunded" | "confirmed" | "cancelled";
};

const badgeMap = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  refunded: "bg-red-50 text-red-700",
  confirmed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

const labelMap = {
  paid: "Pagado",
  pending: "Pendiente",
  refunded: "Reembolsado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeMap[status]}`}>{labelMap[status]}</span>
  );
}
