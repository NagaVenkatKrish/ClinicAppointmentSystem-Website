import React, { createContext, useContext, useState, useEffect } from "react";
import { getUsers } from "../services/api";

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("clinic_role_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem("clinic_role_user");
      }
    }
    return {
      id: "default-patient",
      role: "Patient",
      name: "Patient",
      patientId: 1,
      email: "patient@example.com"
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);

        if (loadedUsers.length > 0) {
          const matched = loadedUsers.find(
            (user) =>
              String(user.id) === String(currentUser?.id) ||
              (currentUser?.id === "default-patient" && user.role === "Patient")
          );
          if (matched) {
            setCurrentUser(matched);
          }
        }
      } catch (error) {
        console.error("Failed to load clinic users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("clinic_role_user", JSON.stringify(user));
  };

  const switchRole = (role) => {
    const found = users.find((user) => user.role.toLowerCase() === role.toLowerCase());
    if (found) {
      switchUser(found);
    } else {
      const fallbackUser = {
        role,
        name: role,
        ...(role === "Patient" ? { patientId: 1 } : {}),
        ...(role === "Doctor" ? { doctorId: 1, specialization: "General Medicine" } : {})
      };
      switchUser(fallbackUser);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
        loading
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
