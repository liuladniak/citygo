import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UploadPage.scss";
import { API_URL } from "../../utils/api";
import publishIcon from "../../assets/icons/publish.svg";
import uploadIcon from "../../assets/icons/upload-file.svg";
import Button from "../../components/Button/Button";
import Wrapper from "../../components/Wrapper/Wrapper";
import Spinner from "../../components/Loader/Spinner";

function UploadPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const defaultThumbnail = `${API_URL}/images/default-thumbnail.jpg`;
  const [isLoading, setIsLoading] = useState(false);

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };
  const handlefileChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    setPosterPreview(defaultThumbnail);
  };

  const handleFileUpoloadSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("channel", "Historic Stream");
    formData.append("description", description);
    formData.append("image", `/images/default-thumbnail.jpg`);
    formData.append("video", videoFile);

    try {
      await axios.post(`${API_URL}/videos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setPosterPreview(null);
      setIsLoading(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setDisplayError(true);
      setErrorMessage(err.response.data.message);
      setIsLoading(false);
    }
  };

  const handleFormReset = (e) => {
    e.preventDefault();

    setTitle("");
    setDescription("");
    setVideoFile(null);
    setPosterPreview(null);
    setDisplayError(false);
  };

  return (
    <main className="upload">
      {isLoading && (
        <div className="upload-spinner">
          <Spinner className="spinner-small" />
        </div>
      )}
      {success && (
        <div className="upload-success">
          <h3>Uploaded successfully!</h3>
          <h4>Thank you for uploading your file</h4>
        </div>
      )}
      {displayError && (
        <div className="upload-fail">
          <h3>File upload failed</h3>
          <h4>{errorMessage}</h4>
        </div>
      )}
      <h1 className="upload__heading">Upload Video</h1>
      <form
        className="form-section"
        action="post"
        encType="multipart/form-data"
        onSubmit={handleFileUpoloadSubmit}
      >
        <Wrapper className="upload-form">
          <div className="upload-preview">
            <label className="form__label" htmlFor="video">
              Video thumbnail
            </label>
            {posterPreview ? (
              <div className="upload-form__img">
                <img src={posterPreview} alt="video thumbnail image" />
              </div>
            ) : (
              <div
                onClick={handleChooseFileClick}
                className="upload-form__choose-file"
              >
                <Wrapper className="upload-drag-n-drop">
                  <span>Click to select your file</span>
                </Wrapper>
                <div>
                  <img
                    className="upload-form__icon"
                    src={uploadIcon}
                    alt="upload icon"
                  />
                </div>

                <input
                  ref={fileInputRef}
                  className="upload-form__file"
                  type="file"
                  name="video"
                  onChange={handlefileChange}
                  required
                />

                <Wrapper className="upload-supports">
                  <span>Supports files: MP4, MKV, WEBM</span>
                  <span>File size should not be more than 50MB</span>
                </Wrapper>
              </div>
            )}
          </div>

          {/* <div className="upload-desc">
            <label className="form__label" htmlFor="title">
              Title your video
              <input
                className="form__field upload-desc__input"
                type="text"
                name="title"
                placeholder="Add a title to your video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="form__label" htmlFor="description">
              Add a video description
              <textarea
                className="form__field upload-desc__textarea"
                type="text"
                name="description"
                placeholder="Add a description to your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>
          </div> */}
        </Wrapper>
        <Wrapper className="upload-publish">
          <Button className="btn--publish" iconUrl={publishIcon} type="submit">
            Publish
          </Button>
          <Button className="btn--cancel" onClick={handleFormReset}>
            Cancel
          </Button>
        </Wrapper>
      </form>
    </main>
  );
}

export default UploadPage;
