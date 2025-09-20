<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    /**
     * Find a user by email.
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Create a new user.
     */
    public function create(array $data): User
    {
        Log::info('Creating new user', ['email' => $data['email']]);

        return User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
        ]);
    }

    /**
     * Find a user by email, or create if not exists.
     */
    public function findOrCreate(array $data): User
    {
        $user = $this->findByEmail($data['email']);

        if ($user) {
            Log::info('User exists, returning existing user', ['user_id' => $user->id]);
            return $user;
        }

        return $this->create($data);
    }

    /**
     * Update user details.
     */
    public function update(User $user, array $data): User
    {
        Log::info('Updating user', ['user_id' => $user->id]);

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);

        $user->save();

        return $user;
    }
}
