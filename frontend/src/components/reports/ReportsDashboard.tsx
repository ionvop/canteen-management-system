import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const pieColors = ["#4f46e5", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

const ReportsDashboard = () => {
  const { token } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: salesSummary } = useQuery({
    queryKey: ["reports", "sales-summary", from, to],
    queryFn: () => {
      if (!token) throw new Error("Session expired");
      return api.getSalesSummary(token, from || undefined, to || undefined);
    },
    enabled: !!token,
  });

  const { data: orderVolume = [] } = useQuery({
    queryKey: ["reports", "order-volume", from, to],
    queryFn: () => {
      if (!token) throw new Error("Session expired");
      return api.getOrderVolume(token, from || undefined, to || undefined);
    },
    enabled: !!token,
  });

  const { data: categorySales = [] } = useQuery({
    queryKey: ["reports", "category-sales", from, to],
    queryFn: () => {
      if (!token) throw new Error("Session expired");
      return api.getCategorySales(token, from || undefined, to || undefined);
    },
    enabled: !!token,
  });

  const summary = useMemo(() => {
    const totalSales = (salesSummary?.daily ?? []).reduce(
      (acc, point) => acc + Number(point.total),
      0,
    );
    const totalOrders = orderVolume.reduce((acc, point) => acc + point.order_count, 0);
    const averageOrderValue = totalOrders ? totalSales / totalOrders : 0;
    return { totalSales, totalOrders, averageOrderValue };
  }, [salesSummary, orderVolume]);

  const exportCsv = () => {
    const rows = [
      ["type", "label", "value1", "value2"].join(","),
      ...orderVolume.map((item) => ["order_volume", item.date, item.order_count, ""].join(",")),
      ...categorySales.map((item) =>
        ["category_sales", item.name, item.total_qty, item.total_revenue].join(","),
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canteen-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Report Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input type="date" className="rounded-xl" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" className="rounded-xl" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="sm:col-span-2 flex gap-2">
            <Button className="rounded-xl" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-primary/20">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">${summary.totalSales.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="rounded-2xl border-primary/20">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{summary.totalOrders}</p></CardContent>
        </Card>
        <Card className="rounded-2xl border-primary/20">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Average Order Value</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">${summary.averageOrderValue.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-primary">Sales Revenue (Daily)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesSummary?.daily ?? []}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-primary">Sales by Category</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={categorySales} dataKey="total_revenue" nameKey="name" outerRadius={95}>
                  {categorySales.map((entry, index) => (
                    <Cell key={entry.id} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-primary">Order Volume (Last 30 days / Selected Range)</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={orderVolume}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="order_count" stroke="#0ea5e9" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;