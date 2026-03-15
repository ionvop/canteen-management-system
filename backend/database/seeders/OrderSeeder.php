<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $customers = \App\Models\User::where('role', 'customer')->get();
        $menuItems = \App\Models\MenuItem::all();

        for ($i = 0; $i < 200; $i++) {
            $order = \App\Models\Order::create([
                'order_number' => 'ORD-' . Str::upper(Str::random(8)),
                'user_id'      => $customers->random()->id ?? null,
                'status'       => collect(['pending','preparing','ready','completed','cancelled'])->random(),
                'total_amount' => 0,
                'created_at'   => now()->subDays(rand(0, 60))->subMinutes(rand(0, 1440)),
            ]);

            $itemsCount = rand(1, 5);
            $total = 0;

            for ($j = 0; $j < $itemsCount; $j++) {
                $menuItem = $menuItems->random();
                $qty = rand(1, 3);
                $price = $menuItem->price;
                $subtotal = $qty * $price;

                \App\Models\OrderItem::create([
                    'order_id'    => $order->id,
                    'menu_item_id'=> $menuItem->id,
                    'quantity'    => $qty,
                    'price'       => $price,
                    'subtotal'    => $subtotal,
                ]);

                $total += $subtotal;
            }

            $order->update(['total_amount' => $total]);
        }
    }
}