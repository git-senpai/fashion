import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FiEdit,
  FiTrash2,
  FiShield,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
} from "react-icons/fi";
import {
  getAllUsers,
  deleteUser,
  getUserStats,
} from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();
  const [expandedUsers, setExpandedUsers] = useState({});
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Effect for authentication check
  useEffect(() => {
    // If admin status is definitively false, set auth error
    if (currentUser === null || isAdmin === false) {
      setAuthError(true);
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  // Effect for data loading
  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchUsers();
    }
  }, [currentUser, isAdmin]);

  const fetchUsers = async () => {
    try {
      // Double-check if user is admin before proceeding
      if (!currentUser || !isAdmin) {
        console.log("Auth check failed:", { currentUser, isAdmin });
        setAuthError(true);
        setLoading(false);
        return;
      }

      console.log("Admin auth check passed:", {
        currentUser: currentUser
          ? `${currentUser.name} (${currentUser.email})`
          : null,
        isAdmin,
      });

      setLoading(true);

      try {
        const usersData = await getAllUsers();
        setUsers(usersData);

        try {
          const statsData = await getUserStats();
          setUserStats(statsData);
        } catch (statsError) {
          console.error("Error fetching user stats:", statsError);
          // Still continue with the users data if stats fail
          toast.error("Could not load detailed user statistics");
        }
      } catch (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      console.log("Auth storage value:", localStorage.getItem("auth-storage"));

      if (error.message && error.message.includes("Not authorized")) {
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
      setUserStats(userStats.filter((user) => user._id !== id));
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

  const toggleUserExpanded = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Find user stats by ID
  const getUserStatsById = (userId) => {
    return userStats.find((stat) => stat._id === userId) || {};
  };

  // Sort users based on current sort field and direction
  const sortedUsers = [...users].sort((a, b) => {
    const statA = getUserStatsById(a._id);
    const statB = getUserStatsById(b._id);

    let valueA, valueB;

    // Determine what values to compare based on sortField
    switch (sortField) {
      case "name":
        valueA = a.name;
        valueB = b.name;
        break;
      case "email":
        valueA = a.email;
        valueB = b.email;
        break;
      case "createdAt":
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
        break;
      case "wishlistCount":
        valueA = statA.wishlistCount || 0;
        valueB = statB.wishlistCount || 0;
        break;
      case "cartCount":
        valueA = statA.cartCount || 0;
        valueB = statB.cartCount || 0;
        break;
      case "orderCount":
        valueA = statA.orderCount || 0;
        valueB = statB.orderCount || 0;
        break;
      case "totalSpent":
        valueA = statA.totalSpent || 0;
        valueB = statB.totalSpent || 0;
        break;
      default:
        valueA = a.name;
        valueB = b.name;
    }

    // Compare and sort
    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Redirect if not admin
  if (authError || (!loading && (!currentUser || !isAdmin))) {
    toast.error("You are not authorized to access the admin users page");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-2 text-2xl font-bold">Users</h1>
      <p className="mb-6 text-muted-foreground">
        Manage users and view detailed statistics about their activity.
      </p>

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
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {sortField === "email" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("wishlistCount")}
                >
                  <div className="flex items-center justify-center">
                    <FiHeart className="mr-1 h-4 w-4" />
                    <span>Liked</span>
                    {sortField === "wishlistCount" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("cartCount")}
                >
                  <div className="flex items-center justify-center">
                    <FiShoppingCart className="mr-1 h-4 w-4" />
                    <span>Cart</span>
                    {sortField === "cartCount" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("orderCount")}
                >
                  <div className="flex items-center justify-center">
                    <FiPackage className="mr-1 h-4 w-4" />
                    <span>Orders</span>
                    {sortField === "orderCount" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("totalSpent")}
                >
                  <div className="flex items-center justify-center">
                    <FiDollarSign className="mr-1 h-4 w-4" />
                    <span>Total Spent</span>
                    {sortField === "totalSpent" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center justify-center">
                    <FiCalendar className="mr-1 h-4 w-4" />
                    <span>Joined</span>
                    {sortField === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => {
                const stats = getUserStatsById(user._id);
                return (
                  <React.Fragment key={user._id}>
                    <tr
                      className={`border-t border-border hover:bg-muted/50 ${
                        expandedUsers[user._id] ? "bg-muted/30" : ""
                      }`}
                      onClick={() => toggleUserExpanded(user._id)}
                    >
                      <td className="px-4 py-3 cursor-pointer">
                        <div className="flex items-center">
                          {expandedUsers[user._id] ? (
                            <FiChevronDown className="mr-2 text-muted-foreground" />
                          ) : (
                            <FiChevronRight className="mr-2 text-muted-foreground" />
                          )}
                          {user._id === currentUser._id ? (
                            <span className="font-medium">
                              {user.name} (You)
                            </span>
                          ) : (
                            user.name
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-800">
                          {stats.wishlistCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                          {stats.cartCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          {stats.orderCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {formatCurrency(stats.totalSpent || 0)}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/admin/users/${user._id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiEdit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user._id !== currentUser._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user._id);
                              }}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded user details */}
                    {expandedUsers[user._id] && (
                      <tr className="bg-muted/20 border-t border-border">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border border-border p-4 bg-card">
                              <h3 className="text-sm font-medium flex items-center mb-4">
                                <FiUser className="mr-2 text-primary" />
                                User Details
                              </h3>
                              <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Role:
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Member For:
                                  </span>
                                  <span>
                                    {stats.daysSinceRegistration || 0} days
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="rounded-lg border border-border p-4 bg-card">
                              <h3 className="text-sm font-medium flex items-center mb-4">
                                <FiShoppingCart className="mr-2 text-primary" />
                                Shopping Behavior
                              </h3>
                              <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Items in Cart:
                                  </span>
                                  <span>{stats.cartCount || 0}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Cart Value:
                                  </span>
                                  <span>
                                    {formatCurrency(stats.cartValue || 0)}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Wishlist Items:
                                  </span>
                                  <span>{stats.wishlistCount || 0}</span>
                                </p>
                              </div>
                            </div>

                            <div className="rounded-lg border border-border p-4 bg-card">
                              <h3 className="text-sm font-medium flex items-center mb-4">
                                <FiFileText className="mr-2 text-primary" />
                                Order Statistics
                              </h3>
                              <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Total Orders:
                                  </span>
                                  <span>{stats.orderCount || 0}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Completed Orders:
                                  </span>
                                  <span>{stats.completedOrders || 0}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Total Spent:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(stats.totalSpent || 0)}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Avg Order Value:
                                  </span>
                                  <span>
                                    {formatCurrency(stats.avgOrderValue || 0)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
