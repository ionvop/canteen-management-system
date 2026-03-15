import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import type { MenuItem } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const defaultForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  is_available: true,
};

const MenuManagementPanel = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const { data: menuResponse } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.getMenu(),
  });

  const menuItems = useMemo(() => menuResponse?.data ?? [], [menuResponse]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["menu"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => {
      if (!token) throw new Error("Session expired. Please log in again.");
      return api.createMenuItem(token, payload);
    },
    onSuccess: () => {
      showSuccess("Menu item created");
      setForm(defaultForm);
      setImageFile(null);
      refresh();
    },
    onError: (error: Error) => showError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) => {
      if (!token) throw new Error("Session expired. Please log in again.");
      return api.updateMenuItem(token, id, payload);
    },
    onSuccess: () => {
      showSuccess("Menu item updated");
      setEditingItem(null);
      setForm(defaultForm);
      setImageFile(null);
      refresh();
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error("Session expired. Please log in again.");
      return api.deleteMenuItem(token, id);
    },
    onSuccess: () => {
      showSuccess("Menu item removed");
      refresh();
    },
    onError: (error: Error) => showError(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error("Session expired. Please log in again.");
      return api.toggleAvailability(token, id);
    },
    onSuccess: () => {
      showSuccess("Availability updated");
      refresh();
    },
    onError: (error: Error) => showError(error.message),
  });

  const loadForEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      category_id: String(item.category_id),
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      stock: String(item.stock),
      is_available: item.is_available,
    });
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("category_id", form.category_id);
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("price", form.price);
    payload.append("stock", form.stock);
    payload.append("is_available", form.is_available ? "1" : "0");
    if (imageFile) payload.append("image", imageFile);
    return payload;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.category_id || !form.name || !form.price || !form.stock) {
      showError("Fill all required fields");
      return;
    }

    const payload = buildPayload();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingItem ? "Edit Menu Item" : "Add Menu Item"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                value={form.category_id}
                onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                className="rounded-xl"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                className="rounded-xl"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="rounded-xl"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  className="rounded-xl"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Menu Item Photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="rounded-xl"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm((prev) => ({ ...prev, is_available: e.target.checked }))}
              />
              Available for orders
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-xl"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingItem ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {editingItem ? "Update" : "Create"}
              </Button>
              {editingItem ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setEditingItem(null);
                    setForm(defaultForm);
                    setImageFile(null);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Existing Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${Number(item.price).toFixed(2)} • Stock {item.stock}
                </p>
                <Badge className={item.is_available ? "bg-emerald-600" : "bg-rose-600"}>
                  {item.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => loadForEdit(item)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => toggleMutation.mutate(item.id)}
                >
                  Toggle
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagementPanel;