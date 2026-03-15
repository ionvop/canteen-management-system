<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // List categories (public)
    public function index()
    {
        return Category::all();
    }

    // Create category (admin only – guarded by routes)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    // Show single category (optional)
    public function show(Category $category)
    {
        return $category->load('menuItems');
    }

    // Update category (admin)
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($data);

        return $category;
    }

    // Delete category (admin)
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Deleted']);
    }
}