<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Daily, weekly, monthly total sales revenue
    public function salesSummary()
    {
        $base = Order::whereIn('status', ['completed', 'ready', 'preparing']);

        $daily = (clone $base)
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $weekly = (clone $base)
            ->selectRaw('YEARWEEK(created_at, 1) as week, SUM(total_amount) as total')
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        $monthly = (clone $base)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return compact('daily', 'weekly', 'monthly');
    }

    // Best-selling menu items by quantity and revenue
    public function bestSellers(Request $request)
    {
        $query = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereIn('orders.status', ['completed', 'ready', 'preparing']);

        if ($request->filled('from')) {
            $query->whereDate('orders.created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('orders.created_at', '<=', $request->input('to'));
        }

        $items = $query
            ->selectRaw('
                menu_items.id,
                menu_items.name,
                SUM(order_items.quantity) as total_qty,
                SUM(order_items.subtotal) as total_revenue
            ')
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_qty')
            ->get();

        return $items;
    }

    // Order volume trends over date range
    public function orderVolume(Request $request)
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to   = $request->input('to', now()->toDateString());

        $data = Order::whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as order_count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $data;
    }

    // Category-level breakdown of sales
    public function categorySales(Request $request)
    {
        $query = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->join('categories', 'categories.id', '=', 'menu_items.category_id')
            ->whereIn('orders.status', ['completed', 'ready', 'preparing']);

        if ($request->filled('from')) {
            $query->whereDate('orders.created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('orders.created_at', '<=', $request->input('to'));
        }

        $data = $query
            ->selectRaw('
                categories.id,
                categories.name,
                SUM(order_items.quantity) as total_qty,
                SUM(order_items.subtotal) as total_revenue
            ')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        return $data;
    }
}