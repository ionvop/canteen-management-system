<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Meals', 'Snacks', 'Beverages', 'Desserts', 'Combos',
        ];

        foreach ($categories as $name) {
            \App\Models\Category::create([
                'name' => $name,
                'description' => $name . ' items',
            ]);
        }
    }
}