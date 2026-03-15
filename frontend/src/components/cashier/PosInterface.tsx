import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import type { MenuItem, OrderStatus } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CartLine = { item: MenuItem; quantity: number };

const statusFlow: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

const PosInterface = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [stockChanges, setStockChanges] = useState<Record<number, number>>({});

  const { data: menuResponse } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.getMenu(),
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ["orders", "queue"],
    queryFn: () => {
      if (!token) throw new Error("Session expired");
      return api.getOrders(token);
    },
    enabled: !!token,
    refetchInterval: 4000,
  });

  const submitOrderMutation = useMutation({
    mutationFn: (items: Array<{ menu_item_id: number; quantity: number }>) => {
      if (!token) throw new Error("Session expired");
      return api.createOrder(token, items);
    },
    onSuccess: (order) => {
      setCart([]);
      showSuccess(`Order ${order.order_number} submitted`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => {
      if (!token) throw new Error("Session expired");
      return api.updateOrderStatus(token, id, status);
    },
    onSuccess: () => {
      showSuccess("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, change }: { id: number; change: number }) => {
      if (!token) throw new Error("Session expired");
      return api.adjustStock(token, id, change, "POS stock adjustment");
    },
    onSuccess: () => {
      showSuccess("Stock updated");
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const menuItems = useMemo(() => menuResponse?.data ?? [], [menuResponse]);
  const orders = useMemo(() => ordersResponse?.data ?? [], [ordersResponse]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((line) => line.item.id === item.id);
      if (exists) {
        return prev.map((line) =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const total = cart.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-primary">POS Menu</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-xl border p-3 space-y-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">${Number(item.price).toFixed(2)}</p>
                <Badge className={item.is_available ? "bg-emerald-600" : "bg-rose-600"}>
                  {item.is_available ? "Available" : "Unavailable"}
                </Badge>
                <Button
                  className="w-full rounded-xl"
                  disabled={!item.is_available}
                  onClick={() => addToCart(item)}
                >
                  Add
                </Button>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    className="rounded-xl"
                    value={stockChanges[item.id] ?? 1}
                    onChange={(e) =>
                      setStockChanges((prev) => ({
                        ...prev,
                        [item.id]: Number(e.target.value || "0"),
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      stockMutation.mutate({
                        id: item.id,
                        change: Number(stockChanges[item.id] ?? 1),
                      })
                    }
                  >
                    +/-
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-primary">Order Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items selected</p>
            ) : (
              cart.map((line) => (
                <div key={line.item.id} className="flex justify-between text-sm">
                  <span>{line.item.name} × {line.quantity}</span>
                  <span>${(Number(line.item.price) * line.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full rounded-xl"
              disabled={cart.length === 0 || submitOrderMutation.isPending}
              onClick={() =>
                submitOrderMutation.mutate(
                  cart.map((line) => ({ menu_item_id: line.item.id, quantity: line.quantity })),
                )
              }
            >
              {submitOrderMutation.isPending ? "Submitting..." : "Submit Order"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Order Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  ${Number(order.total_amount).toFixed(2)} • {new Date(order.created_at).toLocaleString()}
                </p>
                <Badge>{order.status}</Badge>
              </div>
              <div className="flex gap-2">
                {statusFlow.map((status) => (
                  <Button
                    key={`${order.id}-${status}`}
                    variant={order.status === status ? "default" : "outline"}
                    className="rounded-xl capitalize"
                    onClick={() => statusMutation.mutate({ id: order.id, status })}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PosInterface;