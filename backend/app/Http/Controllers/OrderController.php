<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::with('items.menuItem', 'user')
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $user = $request->user(); // customer or cashier on behalf of customer

        return DB::transaction(function () use ($data, $user) {
            $order = Order::create([
                'order_number' => 'ORD-' . Str::upper(Str::random(8)),
                'user_id'      => $user?->id,
                'status'       => 'pending',
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($data['items'] as $itemData) {
                /** @var MenuItem $menuItem */
                $menuItem = MenuItem::lockForUpdate()->find($itemData['menu_item_id']); // prevent race
                $qty = $itemData['quantity'];

                if ($menuItem->stock < $qty) {
                    abort(422, "Insufficient stock for {$menuItem->name}");
                }

                $price = $menuItem->price;
                $subtotal = $price * $qty;

                OrderItem::create([
                    'order_id'    => $order->id,
                    'menu_item_id'=> $menuItem->id,
                    'quantity'    => $qty,
                    'price'       => $price,
                    'subtotal'    => $subtotal,
                ]);

                // auto-deduct inventory upon confirmation (here at creation)
                $menuItem->decrement('stock', $qty);
                InventoryLog::create([
                    'menu_item_id' => $menuItem->id,
                    'change'       => -$qty,
                    'reason'       => 'order:' . $order->order_number,
                ]);

                $total += $subtotal;
            }

            $order->update(['total_amount' => $total, 'status' => 'preparing']); // example flow

            return $order->load('items.menuItem');
        });
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        // You can enforce flow here (Pending → Preparing → Ready → Completed/Cancelled)
        $order->update(['status' => $data['status']]);

        return $order;
    }

    public function show(Order $order)
    {
        return $order->load('items.menuItem', 'user');
    }
}