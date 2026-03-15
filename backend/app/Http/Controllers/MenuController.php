<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return MenuItem::with('category')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'stock'        => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        $item = MenuItem::create($data);

        return response()->json($item, 201);
    }

    public function show(MenuItem $menuItem)
    {
        return $menuItem->load('category');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'category_id'  => 'sometimes|exists:categories,id',
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'sometimes|numeric|min:0',
            'stock'        => 'sometimes|integer|min:0',
            'is_available' => 'boolean',
        ]);

        $menuItem->update($data);

        return $menuItem;
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->is_available = ! $menuItem->is_available;
        $menuItem->save();

        return $menuItem;
    }
}