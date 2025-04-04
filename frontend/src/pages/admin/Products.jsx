import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import {
  getProducts,
  deleteProduct,
  createProduct,
} from "../../services/productService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Check for the actual products array structure
      const productsArray = data.products || data;
      if (Array.isArray(productsArray)) {
        setProducts(productsArray);
      } else {
        console.error("Invalid products data structure:", data);
        toast.error("Failed to fetch products (invalid data structure)");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id, user.token);
      toast.success("Product deleted successfully");
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleCreate = async () => {
    try {
      // Store user token in localStorage for productService to access
      if (user && user.token) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Navigate to product edit page with "new" as the ID
      navigate("/admin/products/new");
    } catch (error) {
      toast.error(error.message || "Failed to create a new product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={handleCreate} className="mt-2 sm:mt-0">
          <FiPlus className="mr-2 h-4 w-4" />
          Create Product
        </Button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          <FiSearch className="h-5 w-5" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-4 animate-pulse"
            >
              <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="flex justify-between">
                <div className="h-8 w-20 rounded bg-gray-200"></div>
                <div className="h-8 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Button onClick={handleCreate}>Create Your First Product</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {product._id.slice(-6)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : "https://placehold.co/100x100?text=No+Image"
                          }
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/100x100?text=Error";
                          }}
                        />
                      </div>
                      <span className="truncate max-w-[180px] md:max-w-[250px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.countInStock > 10
                          ? "bg-green-100 text-green-800"
                          : product.countInStock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.countInStock > 0
                        ? product.countInStock
                        : "Out of stock"}
                    </span>
                    {product.sizeQuantities && product.sizeQuantities.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {product.sizeQuantities
                          .filter(sq => sq.quantity > 0)
                          .map(sq => `${sq.size} (${sq.quantity})`)
                          .join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/products/${product._id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </Button>
                      </Link>
                      <Link to={`/admin/products/${product._id}`}>
                        <Button variant="ghost" size="sm">
                          <FiEdit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
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

export default Products;
