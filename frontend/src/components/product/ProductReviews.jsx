import { useState } from "react";
import { FiStar, FiUpload, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../ui/Form";
import { toast } from "sonner";
import { createProductReview } from "../../services/productService";

const ProductReviews = ({
  product,
  user,
  isAuthenticated,
  onReviewSubmitted,
}) => {
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [],
  });
  const [reviewImages, setReviewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === "rating" ? parseInt(value) : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Limit to 5 images total
    if (previewImages.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images per review");
      return;
    }

    // Create preview URLs and add files to state
    const newPreviewImages = [...previewImages];
    const newReviewImages = [...reviewImages];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error(`File ${file.name} is not an image`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 5MB size limit`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newPreviewImages.push(previewUrl);
      newReviewImages.push(file);
    });

    setPreviewImages(newPreviewImages);
    setReviewImages(newReviewImages);

    // Update review form
    setReviewForm({
      ...reviewForm,
      images: newReviewImages,
    });
  };

  const removeImage = (index) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);

    const newPreviewImages = [...previewImages];
    const newReviewImages = [...reviewImages];

    newPreviewImages.splice(index, 1);
    newReviewImages.splice(index, 1);

    setPreviewImages(newPreviewImages);
    setReviewImages(newReviewImages);

    // Update review form
    setReviewForm({
      ...reviewForm,
      images: newReviewImages,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      setReviewError("Please enter a comment");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      if (!user) {
        toast.error("You must be logged in to submit a review");
        return;
      }

      // Create FormData to send text fields and images
      const formData = new FormData();
      formData.append("rating", reviewForm.rating);
      formData.append("comment", reviewForm.comment);

      // Append each image to the form data
      reviewImages.forEach((image) => {
        formData.append("images", image);
      });

      await createProductReview(product._id, formData, user.token);
      toast.success("Review submitted successfully");

      // Notify parent component to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Reset form
      setReviewForm({
        rating: 5,
        comment: "",
        images: [],
      });
      setReviewImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError(
        error.message || "Failed to submit review. Please try again."
      );
      toast.error(error.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {isAuthenticated ? (
        <div className="mb-6 rounded-lg border border-border p-4">
          <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <FormGroup>
              <FormLabel>Rating</FormLabel>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="p-1"
                    aria-label={`Rate ${star} stars`}
                  >
                    <FiStar
                      className={`h-5 w-5 ${
                        star <= reviewForm.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </FormGroup>
            <FormGroup>
              <FormLabel>Your Review</FormLabel>
              <textarea
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                rows={4}
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                placeholder="Share your thoughts about this product..."
              />
              {reviewError && <FormMessage>{reviewError}</FormMessage>}
            </FormGroup>

            {/* Image Upload Section */}
            <FormGroup>
              <FormLabel>Add Photos (optional - max 5)</FormLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Show preview of uploaded images */}
                {previewImages.map((preview, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-20 rounded-md overflow-hidden group"
                  >
                    <img
                      src={preview}
                      alt={`Review upload ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 rounded-full bg-foreground/50 p-1 text-white hover:bg-foreground transition-colors"
                      aria-label="Remove image"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}

                {/* Upload button (only show if less than 5 images) */}
                {previewImages.length < 5 && (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                    <FiUpload className="mb-1 h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      aria-label="Upload review images"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF (max 5MB each)
              </p>
            </FormGroup>

            <Button type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-border p-4 text-center">
          <p className="mb-2 text-muted-foreground">
            Please sign in to write a review
          </p>
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>

        {product?.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border border-border p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-8 w-8 rounded-full bg-muted text-center leading-8">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <div className="flex items-center">
                        {Array(5)
                          .fill()
                          .map((_, index) => (
                            <FiStar
                              key={index}
                              className={`h-3 w-3 ${
                                index < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-3">{review.comment}</p>

                {/* Display review images if available */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="h-20 w-20 rounded-md overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="h-full w-full object-cover"
                          onClick={() => window.open(image, "_blank")}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
