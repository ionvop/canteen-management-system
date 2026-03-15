<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function updateStock(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'change' => 'required|integer', // positive or negative
            'reason' => 'nullable|string',
        ]);

        $menuItem->stock += $data['change'];
        if ($menuItem->stock < 0) {
            $menuItem->stock = 0;
        }
        $menuItem->save();

        InventoryLog::create([
            'menu_item_id' => $menuItem->id,
            'change'       => $data['change'],
            'reason'       => $data['reason'] ?? 'manual_adjustment',
        ]);

        return $menuItem;
    }
}