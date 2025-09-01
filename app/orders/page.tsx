import OpenOrders from "@/components/OpenOrders";
import HistoryTable from "@/components/HistoryTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <OpenOrders />
      <HistoryTable />
    </div>
  );
}
