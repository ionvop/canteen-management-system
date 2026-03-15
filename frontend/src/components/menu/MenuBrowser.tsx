import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import type { MenuItem } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CartLine = { item: MenuItem; quantity: number };

const MenuBrowser = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const { data: menuResponse, isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.getMenu(),
  });

  const placeOrderMutation = useMutation({
    mutationFn: (items: Array<{ menu_item_id: number; quantity: number }>) => {
      if (!token) throw new Error("Session expired. Please log in again.");
      return api.createOrder(token, items);
    },
    onSuccess: (order) => {
      showSuccess(`Order ${order.order_number} placed`);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const menuItems = menuResponse?.data ?? [];
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = categoryId === "all" || String(item.category_id) === categoryId;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, categoryId, search]);

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) {
      showError(`${item.name} is currently unavailable`);
      return;
    }

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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Search menu</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search food or drinks"
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading menu...</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="rounded-2xl border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-primary">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.image_url || item.photo_url ? (
                  <img
                    src={item.image_url || item.photo_url || ""}
                    alt={item.name}
                    className="h-36 w-full object-cover rounded-xl"
                  />
                ) : null}
                <p className="text-sm text-muted-foreground min-h-[40px]">
                  {item.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
                  <Badge
                    className={item.is_available ? "bg-emerald-600" : "bg-rose-600"}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={() => addToCart(item)}
                  disabled={!item.is_available}
                >
                  Add to order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <aside>
        <Card className="rounded-2xl sticky top-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Current Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items selected yet.</p>
            ) : (
              cart.map((line) => (
                <div key={line.item.id} className="flex items-center justify-between text-sm">
                  <span>{line.item.name} × {line.quantity}</span>
                  <span>${(Number(line.item.price) * line.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="pt-2 border-t flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full rounded-xl"
              disabled={cart.length === 0 || placeOrderMutation.isPending}
              onClick={() =>
                placeOrderMutation.mutate(
                  cart.map((line) => ({
                    menu_item_id: line.item.id,
                    quantity: line.quantity,
                  })),
                )
              }
            >
              {placeOrderMutation.isPending ? "Submitting..." : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

export default MenuBrowser;