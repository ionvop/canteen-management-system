<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run()
    {
        $customerNames = ['John', 'Jane', 'Bob', 'Alice', 'Emily', 'Michael', 'Sarah', 'David', 'Olivia', 'James'];
        $customerEmails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'emily@example.com', 'michael@example.com', 'sarah@example.com', 'david@example.com', 'olivia@example.com', 'james@example.com'];

        \App\Models\User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Cashier User',
            'email' => 'cashier@example.com',
            'role' => 'cashier',
            'password' => bcrypt('password'),
        ]);

        // \App\Models\User::factory(10)->create([
        //     'role' => 'customer',
        // ]);

        for ($i = 0; $i < 10; $i++) {
            \App\Models\User::factory()->create([
                'name' => $customerNames[$i],
                'email' => $customerEmails[$i],
                'role' => 'customer',
                'password' => bcrypt('password'),
            ]);
        }
    }
}