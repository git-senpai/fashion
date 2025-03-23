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
    navigate("/admin/products/new/edit");
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
                <th className="px-4 py-2 text-left">Name</th>
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
                  <td className="px-4 py-2">{product.name}</td>
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
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/admin/products/${product._id}/edit`}>
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
