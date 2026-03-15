<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryLog extends Model
{
    use HasFactory;

    protected $fillable = ['menu_item_id', 'change', 'reason'];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}