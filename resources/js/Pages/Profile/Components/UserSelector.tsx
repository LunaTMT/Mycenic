import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import TextInput from "@/Components/Login/TextInput";
import { useUser } from "@/Contexts/UserContext";
import { User } from "@/types/User";


export default function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Get current user and onSelectUser from UserContext
  const { user: currentUser, onSelectUser } = useUser();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/admin/all-users")
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch(() => {
        setUsers([]);
        setFilteredUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const selectedUserLabel = currentUser
    ? `${currentUser.name} — ${currentUser.email}`
    : "Select User";

  return (
    <div className="p-2">
      <Dropdown onOpenChange={setOpen} open={open}>
        <Dropdown.Trigger>
          <div className="w-80 px-3 py-1 border rounded-md text-left cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white dark:bg-[#424549]/80 border-black/20 dark:border-white/20">
            <span className="truncate">{selectedUserLabel}</span>
            <ArrowIcon w="16" h="16" isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <div className="w-80 bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600 text-sm p-2">
            <TextInput
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-2"
              autoFocus
            />

            {loading ? (
              <p className="text-center text-gray-600 dark:text-gray-300">
                Loading users...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300">
                No users found
              </p>
            ) : (
              <ul className="max-h-lg overflow-auto rounded-md border border-gray-300 dark:border-gray-600">
                {filteredUsers.map((user, i) => (
                  <li
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user.id);  // updates context user here
                      setOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                      i === 0 ? "rounded-t-md" : ""
                    } ${i === filteredUsers.length - 1 ? "rounded-b-md" : ""}`}
                  >
                    {user.name} — {user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
