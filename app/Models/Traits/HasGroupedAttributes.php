<?php

namespace App\Models\Traits;

trait HasGroupedAttributes
{
    /**
     * Group model timestamps under a single attribute.
     */
    public function getTimestampsAttribute(): array
    {
        return [
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'expires_at' => $this->expires_at ?? null,
        ];
    }

    /**
     * Group numeric fields under a single attribute.
     * Define $numericFields = ['field1', 'field2'] in the model using this trait.
     */
    public function getAmountsAttribute(): array
    {
        $amounts = [];
        if (!empty($this->numericFields)) {
            foreach ($this->numericFields as $field) {
                $amounts[$field] = $this->{$field} ?? 0;
            }
        }
        return $amounts;
    }
}
