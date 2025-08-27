import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "@/Components/Dropdown/Dropdown";
import TextInput from "@/Components/Login/TextInput";
import { useUser } from "@/Contexts/UserContext";
import { User } from "@/types/User";

export default function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full">
      <Dropdown
        items={dropdownItems}
        selectedItemId={selectedItemId}
        onSelect={(id) => onSelectUser(id)}
        placeholder="Select User"
        onCustomAction={() => setSearchTerm("")}
        
      >
      </Dropdown>
    </div>
  );
}
