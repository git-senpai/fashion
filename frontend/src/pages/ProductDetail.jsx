import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductDetails } from "../services/productService";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuth } from "../hooks/useAuth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";

// Import all product components from the barrel file
import {
  ProductGallery,
  ProductInfo,
  ProductActions,
  ProductSizeSelector,
  ProductTabs,
  RelatedProducts,
  Breadcrumbs,
  WishlistModal,
  UserLikedProducts,
} from "../components/product";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    collections,
    createCollection,
    initCollections,
  } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  // Check if the product is in the wishlist
  const productInWishlist = product ? isInWishlist(product._id) : false;

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductDetails(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Initialize wishlist collections when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initCollections();
    }
  }, [isAuthenticated, initCollections]);

  // Handle wishlist actions
  const handleWishlistToggle = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      navigate("/login?redirect=products/" + id);
      return;
    }

    // If product is already in wishlist, remove it
    if (productInWishlist) {
      setAddingToWishlist(true);
      try {
        await removeFromWishlist(product._id);
        toast.success(`${product.name} removed from wishlist`);
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error(error.message || "Failed to remove from wishlist");
      } finally {
        setAddingToWishlist(false);
      }
      return;
    }

    // If product is not in wishlist and we have collections, show the modal
    if (collections && collections.length > 0) {
      setShowWishlistModal(true);
    } else {
      // No collections, add directly to main wishlist
      addToMainWishlist();
    }
  };

  const addToMainWishlist = async () => {
    setShowWishlistModal(false);
    setAddingToWishlist(true);
    try {
      await addToWishlist(product);
      toast.success(`${product.name} added to wishlist`);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.message || "Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const addToCollection = async (collectionId) => {
    setShowWishlistModal(false);
    setAddingToWishlist(true);
    try {
      await addToWishlist(product, collectionId);
      toast.success(`${product.name} added to collection`);
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast.error(error.message || "Failed to add to collection");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleCreateCollection = async (name) => {
    try {
      const newCollections = await createCollection(name);

      // If we have the new collection, add the product to it
      if (newCollections && newCollections.length > 0) {
        const newCollection = newCollections[newCollections.length - 1];
        addToCollection(newCollection._id);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create collection");
    }
  };

  const handleReviewSubmitted = async () => {
    // Refresh product data after a review is submitted
    try {
      const updatedProduct = await getProductDetails(id);
      setProduct(updatedProduct);
    } catch (error) {
      console.error("Error refreshing product data:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Skeleton height={400} className="mb-4 rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {Array(4)
                .fill()
                .map((_, index) => (
                  <Skeleton key={index} height={80} className="rounded-md" />
                ))}
            </div>
          </div>
          <div>
            <Skeleton height={36} width={300} className="mb-2" />
            <Skeleton height={24} width={150} className="mb-4" />
            <Skeleton height={24} width={100} className="mb-4" />
            <Skeleton height={100} className="mb-4" />
            <Skeleton height={50} width={200} className="mb-4" />
            <Skeleton height={50} width={150} />
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The product you are looking for might have been removed or is
          temporarily unavailable.
        </p>
        <Link
          to="/products"
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  // Prepare image list for gallery
  const productImages = (() => {
    // If product has an images array and it's not empty
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // If product has a single image property
    else if (product.image) {
      return [product.image];
    }
    // Fallback to placeholder
    else {
      return ["https://placehold.co/600x400?text=No+Image"];
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs product={product} />

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Product Gallery */}
            <ProductGallery images={productImages} productName={product.name} />

            {/* Product Info */}
            <div>
              {/* Basic Info */}
              <ProductInfo product={product} />

              {/* Size Selector */}
              <ProductSizeSelector
                sizeQuantities={product.sizeQuantities}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />

              {/* Add to Cart & Wishlist */}
              <ProductActions
                product={product}
                selectedSize={selectedSize}
                productInWishlist={productInWishlist}
                onToggleWishlist={handleWishlistToggle}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>

        {/* Product Tabs (Description, Specifications, Reviews) */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-sm sm:p-8">
          <ProductTabs
            product={product}
            onReviewSubmitted={handleReviewSubmitted}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Similar Products - From the same category */}
        <RelatedProducts
          currentProductId={product._id}
          categoryId={product.category}
        />

        {/* Products You've Liked */}
        <UserLikedProducts currentProductId={product._id} />
      </div>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <WishlistModal
          isOpen={showWishlistModal}
          onClose={() => setShowWishlistModal(false)}
          collections={collections || []}
          onAddToDefault={addToMainWishlist}
          onAddToCollection={addToCollection}
          onCreateCollection={handleCreateCollection}
          product={product}
        />
      )}
    </div>
  );
};

export default ProductDetail;
