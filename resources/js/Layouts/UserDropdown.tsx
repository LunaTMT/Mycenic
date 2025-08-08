import React, { useState, useEffect, useMemo } from 'react';
import Dropdown from '@/Components/Dropdown/Dropdown';
import { useProfile } from '@/Contexts/Profile/ProfileContext'; // adjust path if needed
import axios from 'axios';

export default function UserDropdown() {
  const { user: currentUser, setUser } = useProfile();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Only allow admins to see dropdown
  const isAdmin = currentUser?.is_admin ?? false;

  // Fetch all users once on mount
  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get('/api/users') // adjust your API endpoint
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // Filter users by search input
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower)
    );
  }, [search, users]);

  if (!isAdmin) return null;

  const onSelect = (selectedUser: { id: number; name: string; email: string }) => {
    setUser(selectedUser);
  };

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button
          type="button"
          className="px-4 py-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
        >
          Select User
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content
        align="left"
        width="48"
        contentClasses="bg-white dark:bg-gray-900 rounded shadow-lg max-h-80 overflow-auto"
      >
        <div className="p-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-2 px-3 py-1 border rounded dark:bg-gray-700 dark:text-white"
          />

          {loading && (
            <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
              No users found.
            </div>
          )}

          {!loading &&
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelect(user)}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                type="button"
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
              </button>
            ))}
        </div>
      </Dropdown.Content>
    </Dropdown>
  );
}
