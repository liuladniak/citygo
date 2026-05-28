import { useState } from "react";
import axios from "axios";
import StarRating from "../StarRating/StarRating";
import Button from "../Button/Button";
import { supabase } from "../../lib/supabaseClient";
import "./ReviewForm.scss";

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE_MB = 5;

const ReviewForm = ({ bookingId, tourName, onSubmitted }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  console.log("API_URL:", API_URL);
  console.log("posting to:", `${API_URL}/api/reviews`);
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_PHOTOS - photos.length;
    if (!remaining) return;

    const valid = files.slice(0, remaining).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Each photo must be under ${MAX_FILE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    const newPhotos = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    setError("");
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? "anon";
    const uploaded = [];

    for (let i = 0; i < photos.length; i++) {
      const { file } = photos[i];
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${i}.${ext}`;

      setUploadProgress(`Uploading photo ${i + 1} of ${photos.length}...`);

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(path, file, { upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("review-images").getPublicUrl(path);

      uploaded.push(publicUrl);
    }

    setUploadProgress("");
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating) return setError("Please select a rating.");
    if (!body.trim()) return setError("Please write a review.");

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const photoUrls = photos.length > 0 ? await uploadPhotos() : [];
      console.log("submitting review:", {
        booking_id: bookingId,
        rating,
        title,
        body,
        photos: photoUrls,
      });
      await axios.post(
        `${API_URL}/api/reviews`,
        { booking_id: bookingId, rating, title, body, photos: photoUrls },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSubmitted?.();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to submit. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="review-form__heading">Review your experience</h3>
      {tourName && <p className="review-form__tour">{tourName}</p>}

      <div className="review-form__field">
        <label className="review-form__label">Your rating</label>
        <StarRating
          rating={rating}
          mode="input"
          size="lg"
          onChange={setRating}
        />
      </div>

      <div className="review-form__field">
        <label className="review-form__label" htmlFor="review-title">
          Title <span className="review-form__optional">(optional)</span>
        </label>
        <input
          id="review-title"
          className="review-form__input"
          type="text"
          placeholder="Summarise your experience"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="review-form__field">
        <label className="review-form__label" htmlFor="review-body">
          Your review
        </label>
        <textarea
          id="review-body"
          className="review-form__textarea"
          placeholder="What did you enjoy? What would you tell a friend?"
          value={body}
          rows={5}
          maxLength={1000}
          onChange={(e) => setBody(e.target.value)}
        />
        <span className="review-form__count">{body.length} / 1000</span>
      </div>

      <div className="review-form__field">
        <label className="review-form__label">
          Photos{" "}
          <span className="review-form__optional">
            (optional, up to {MAX_PHOTOS})
          </span>
        </label>

        {photos.length > 0 && (
          <div className="review-form__previews">
            {photos.map((photo, i) => (
              <div key={i} className="review-form__preview">
                <img src={photo.preview} alt={`Preview ${i + 1}`} />
                <button
                  type="button"
                  className="review-form__preview-remove"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_PHOTOS && (
          <label className="review-form__upload-btn">
            + Add photo
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      {uploadProgress && (
        <p className="review-form__progress">{uploadProgress}</p>
      )}
      {error && <p className="review-form__error">{error}</p>}

      <Button type="submit" className="btn btn--book" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
