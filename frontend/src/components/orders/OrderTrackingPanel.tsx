import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { OrderStatus } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const progressMap: Record<OrderStatus, number> = {
  pending: 20,
  preparing: 45,
  ready: 75,
  completed: 100,
  cancelled: 100,
};

const OrderTrackingPanel = () => {
  const { token } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: ordersResponse } = useQuery({
    queryKey: ["orders", "tracking"],
    queryFn: () => {
      if (!token) throw new Error("Session expired");
      return api.getOrders(token);
    },
    enabled: !!token,
    refetchInterval: 4000,
  });

  const orders = useMemo(() => ordersResponse?.data ?? [], [ordersResponse]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Your Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              className="w-full text-left rounded-xl border p-3 hover:bg-accent"
              onClick={() => setSelectedOrderId(order.id)}
            >
              <p className="font-medium">{order.order_number}</p>
              <p className="text-xs text-muted-foreground">
                ${Number(order.total_amount).toFixed(2)} • {new Date(order.created_at).toLocaleString()}
              </p>
              <Badge className="mt-2 capitalize">{order.status}</Badge>
            </button>
          ))}
          {orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedOrder ? (
            <>
              <div>
                <p className="font-semibold">{selectedOrder.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  Current status: <span className="capitalize">{selectedOrder.status}</span>
                </p>
              </div>
              <Progress value={progressMap[selectedOrder.status]} className="h-3 rounded-full" />
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menu_item?.name ?? "Item"} × {item.quantity}</span>
                    <span>${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
              {selectedOrder.status === "completed" ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Receipt Ready
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order completed at {new Date(selectedOrder.created_at).toLocaleString()}.
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select an order to track.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackingPanel;