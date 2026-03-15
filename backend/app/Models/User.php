<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // or Passport
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isCashier()
    {
        return $this->role === 'cashier';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }
}