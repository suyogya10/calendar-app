<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Illuminate\Support\Str;

class UserImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Skip if mandatory fields are missing or if it's an empty row ghost
        if (empty($row['name']) || empty($row['employee_id'])) {
            return null;
        }

        $email = isset($row['email']) ? trim((string)$row['email']) : null;
        $dept = isset($row['department']) ? trim((string)$row['department']) : null;

        return new User([
            'name'        => trim($row['name']),
            'employee_id' => trim((string)$row['employee_id']),
            'email'       => $email === '' ? null : $email,
            'department'  => $dept === '' ? null : $dept,
            'password'    => Hash::make($row['password'] ?? Str::random(10)),
            'is_admin'    => (bool)($row['is_admin'] ?? false),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'employee_id' => 'required|unique:users,employee_id',
            'email' => 'nullable|email',
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }
}
