<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run()
    {
        $categories = \App\Models\Category::all();
        $count = 1;

        // create at least 30 items
        \App\Models\MenuItem::factory(30)->make()->each(function ($item) use ($categories, &$count) {
            $item->name = 'Item ' . $count++;
            $item->price = rand(10, 100);
            $item->category_id = $categories->random()->id;
            $item->stock = rand(20, 200);
            $item->is_available = true;
            $item->save();
        });
    }
}