import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { FiEdit, FiTrash2, FiShield, FiUser } from "react-icons/fi";
import { getAllUsers, deleteUser } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Check if user is admin before proceeding
      if (!currentUser || !isAdmin) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.message.includes("Not authorized as admin")) {
        setAuthError(true);
      }
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Don't allow deleting yourself
    if (id === currentUser._id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Redirect if not admin
  if (authError || (!loading && (!currentUser || !isAdmin))) {
    toast.error("You are not authorized to access the admin users page");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-4 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-4 w-48 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-32 rounded bg-gray-200 mb-2"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Joined</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {user._id.slice(-6)}
                  </td>
                  <td className="px-4 py-2">
                    {user._id === currentUser._id ? (
                      <span className="font-medium">{user.name} (You)</span>
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isAdmin
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.isAdmin ? (
                        <>
                          <FiShield className="mr-1 h-3 w-3" />
                          Admin
                        </>
                      ) : (
                        <>
                          <FiUser className="mr-1 h-3 w-3" />
                          Customer
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/admin/users/${user._id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <FiEdit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {user._id !== currentUser._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
