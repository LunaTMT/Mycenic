import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "@/Components/Dropdown/Dropdown";
import TextInput from "@/Components/Login/TextInput";
import { useUser } from "@/Contexts/User/UserContext";
import { User } from "@/types/User";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface UserSelectorProps {
  onClose: () => void;
}

export default function UserSelector({ onClose }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const { user: currentUser, fetchUserById } = useUser();

  // Fetch all users
  useEffect(() => {
    setLoading(true);
    axios
      .get("/users") // updated endpoint
      .then((res) => {
        setUsers(res.data.users); // match API structure { users: [...] }
        setFilteredUsers(res.data.users);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsers([]);
        setFilteredUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter users by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const selectedItemId = currentUser?.id ?? null;

  const dropdownItems = filteredUsers.map((u) => ({
    id: u.id,
    label: `${u.name} — ${u.email}`,
  }));

  const handleSelect = (id: number) => {
    console.log("Selected user ID:", id);
    fetchUserById(id); // update user in context
    onClose();         // close modal
  };

  return (
    <div className="w-full flex flex-col h-[100vh] bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#424549] p-5 border-b border-black/20 dark:border-white/20 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Selection
        </h2>
        <motion.button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
          whileHover={{ rotate: 90, scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiX size={24} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <TextInput
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No users found.
          </p>
        ) : (
          <Dropdown
            items={dropdownItems}
            selectedItemId={selectedItemId}
            onSelect={handleSelect}
            placeholder="Select User"
            onCustomAction={() => setSearchTerm("")}
          />
        )}
      </div>
    </div>
  );
}
