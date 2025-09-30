<?php

namespace App\Services\User;

use App\Models\User\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function create(array $data): User
    {
        Log::info('Creating new user', ['email' => $data['email']]);

        return User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
        ]);
    }

    public function findOrCreate(array $data): User
    {
        $user = $this->findByEmail($data['email']);
        if ($user) {
            Log::info('User exists, returning existing user', ['user_id' => $user->id]);
            return $user;
        }

        return $this->create($data);
    }

    public function update(User $user, array $data): User
    {
        Log::info('Updating user', ['user_id' => $user->id]);

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);

        $user->save();
        return $user;
    }

    /**
     * Return a guest user instance
     */
    public function guest(): User
    {
        return User::guest();
    }
}
