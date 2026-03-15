import AppShell from "@/components/layout/AppShell";
import OrderTrackingPanel from "@/components/orders/OrderTrackingPanel";

const OrderTracking = () => {
  return (
    <AppShell title="Order Tracking">
      <OrderTrackingPanel />
    </AppShell>
  );
};

export default OrderTracking;