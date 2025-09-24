<?php

namespace App\Services;

use App\Models\Item;

class ItemService
{
    /**
     * Create a new item along with optional images
     */
    public function create(array $data): Item
    {
        $images = $data['images'] ?? [];
        unset($data['images']);

        $item = Item::create($data);

        foreach ($images as $path) {
            $item->images()->create(['path' => $path]);
        }

        return $item->load('images');
    }

    /**
     * Update an existing item
     */
    public function update(Item $item, array $data): Item
    {
        $images = $data['images'] ?? null;
        unset($data['images']);

        $item->update($data);

        if (is_array($images)) {
            $item->images()->delete();
            foreach ($images as $path) {
                $item->images()->create(['path' => $path]);
            }
        }

        return $item->load('images');
    }

    /**
     * Delete an item
     */
    public function delete(Item $item): bool
    {
        $item->images()->delete();
        return $item->delete();
    }
}
