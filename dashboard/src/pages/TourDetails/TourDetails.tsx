import axios from "axios";
import "./TourDetails.scss";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import arrowBack from "../../assets/icons/arrowBack.svg";
import Input from "../../components/ui/Input/Input";
import SelectInput from "../../components/ui/SelectInput/SelectInput";
import Button from "../../components/ui/Button/Button";
import TextArea from "../../components/ui/TextArea/TextArea";

const optionsActivity = ["Easy", "Medium", "Hard"];
const optionsCategory = ["Guided tour", "Culinary tour", "Experience"];
const optionsLandmark = ["Center", "Neighborhood"];
const optionsAccessibility = [
  "Fully Wheelchair Accessible",
  "Partially Wheelchair Accessible",
  "Not Wheelchair Accessible",
  "Audio Guide Available",
  "Sign Language Interpretation Available",
  "No Hearing Assistance Available",
  "Audio-Described Tours Available",
  "Tactile Maps/Guides Available",
  "No Visual Accommodations Available",
  "Elevator/Lift Access Available",
  "Stair-Free Access",
  "Assistance with Mobility Devices Available",
  "Rest Stops/Seating Available",
  "Elderly-Friendly",
  "Family-Friendly",
  "Pet-Friendly",
];

const TourDetails = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  type FormDataType = {
    images: string[];
    tourName: string;
    price: string;
    adultPrice: string;
    childPrice: string;
    duration: string;
    activity_level: string;
    category: string;
    overview_title: string;
    overview: string;
    landmarks: string;
    groups: string;
    minimum_of_attendees: string;
    additional_costs: string;
    start_time: string;
    end_time: string;
    latitude: string;
    longitude: string;
    accessibility: string;
    highlights: string[];
    essentials: string;
    includes: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    images: [],
    tourName: "",
    price: "",
    adultPrice: "",
    childPrice: "",
    duration: "",
    activity_level: "",
    category: "",
    overview_title: "",
    overview: "",
    landmarks: "",
    groups: "",
    minimum_of_attendees: "",
    additional_costs: "",
    start_time: "",
    end_time: "",
    latitude: "",
    longitude: "",
    accessibility: "",
    highlights: [],
    essentials: "",
    includes: "",
  });

  useEffect(() => {
    const getOneTourData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${slug}`);
        console.log(response.data, "response data:");
        setFormData((prevData) => ({
          ...prevData,
          ...response.data,
          highlights: response.data.highlights || [],
          essentials: response.data.essentials || [],
          includes: response.data.includes || [],
          meetingPoint: response.data.meetingPoint || {
            latitude: "",
            longitude: "",
          },
        }));
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTourData();
  }, [slug]);

  const handleInputChange = <K extends keyof FormDataType>(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as K]: value,
    }));
  };

  const handleArrayChange = <K extends keyof FormDataType>(
    field: K,
    index: number,
    value: string
  ) => {
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: (prevData[field] as string[]).map((item, i) =>
          i === index ? value : item
        ),
      }));
    }
  };

  const handleAddItem = <K extends keyof FormDataType>(
    field: K,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: [...prevData[field], ""],
      }));
    }
  };

  const handleRemoveItem = <K extends keyof FormDataType>(
    field: K,
    index: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: (prevData[field] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/tours/${slug}`, formData);
      alert("Tour details updated successfully!");
    } catch (error) {
      console.error("Error updating tour details:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="tour">
      <form onSubmit={handleSubmit}>
        <div className="tour__header">
          <Link to="/tours" className="icon--arrowBack">
            <img src={arrowBack} alt="arrow back icon" />
          </Link>

          <Input
            className="input__tour-name"
            type="text"
            placeholder="Tour Name"
            value={formData.tourName}
            onChange={handleInputChange}
          />
          <Button className="">Save</Button>
        </div>

        <div className="tour__images">
          {formData.images.map((image, index) => (
            <div key={index} className="tour__image">
              <img
                src={`${API_URL}/${image}`}
                alt={`Image of ${formData.tourName} ${index + 1}`}
              />
            </div>
          ))}
          <div className="tour__image tour__image--add">
            <span>+</span>
            <span>Add Image</span>
          </div>
        </div>

        <div className="tour-details">
          <h2 className="tour-details__heading">Tour Details</h2>
          <div className="tour-details__prices">
            <div className="tour-details__price">
              <label className="label">Tour price for an adult</label>
              <Input
                type="number"
                placeholder="$"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="tour-details__price">
              <label className="label">Tour price for a child</label>
              <Input
                type="number"
                placeholder="$"
                value={formData.childPrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="tour-details__duration">
              <label className="label">Tour Duration</label>
              <Input
                type="text"
                placeholder="hr"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="select-inputs">
            <div className="tour-details__activity">
              <label className="label" htmlFor="activity">
                Activity level
              </label>

              <SelectInput
                options={optionsActivity}
                placeholder="Activity level..."
                value={formData.activity_level}
                onChange={handleInputChange}
              />
            </div>
            <div className="tour-details__category">
              <label className="label" htmlFor="category">
                Tour Category
              </label>
              <SelectInput
                options={optionsCategory}
                placeholder="Category..."
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="tour-details__landmark">
              <label className="label" htmlFor="activity">
                Landmark
              </label>

              <SelectInput
                options={optionsLandmark}
                placeholder="Select landmark..."
                value={formData.landmarks}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label>Tour Overiew Title</label>
            <Input
              className="input__tour-name"
              type="text"
              placeholder="Overview Title..."
              value={formData.overview_title}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__overview">
            <label className="label" htmlFor="overview">
              Tour Overview
            </label>
            <TextArea
              placeholder="Tour Overview..."
              value={formData.overview}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__highlights">
            <label className="label">Highlights</label>

            <ul className="highlights__list">
              {formData.highlights.map((item, index) => (
                <li key={index} className="highlight-item">
                  <Input
                    placeholder=""
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("highlights", index, e.target.value)
                    }
                  />
                  <Button
                    onClick={(e) => handleRemoveItem("highlights", index, e)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={(e) => handleAddItem("highlights", e)}>
              Add Highlight
            </Button>
          </div>
          <div className="tour-details__essentials">
            <label className="label">Essentials</label>

            <Input
              type="text"
              placeholder="Essentials..."
              value={formData.essentials}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__includes">
            <label className="label">Includes</label>

            <Input
              className="input__includes"
              type="text"
              placeholder="Includes..."
              value={formData.includes}
              onChange={handleInputChange}
            />
          </div>

          <div className="tour-details__landmark">
            <label className="label" htmlFor="activity">
              Accessibility
            </label>

            <SelectInput
              options={optionsAccessibility}
              placeholder="Select accessibility..."
              value={formData.accessibility}
              onChange={handleInputChange}
            />
          </div>

          <div className="tour-details__max-group">
            <label className="label">Maximum Group size</label>
            <Input
              type="number"
              placeholder="Max group size..."
              value={formData.groups}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__min-group">
            <label className="label">Minimum Group size</label>
            <Input
              type="number"
              placeholder="Minimum group size..."
              value={formData.minimum_of_attendees}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__add-costs">
            <label className="label">Additional costs</label>
            <Input
              type="text"
              placeholder="Additional costs..."
              value={formData.additional_costs}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__start-time">
            <label className="label">Start time</label>
            <Input
              type="time"
              placeholder="Start time..."
              value={formData.start_time}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__end-time">
            <label className="label">End time</label>
            <Input
              type="time"
              placeholder="End time..."
              value={formData.end_time}
              onChange={handleInputChange}
            />
          </div>
          <div className="tour-details__meeting-point">
            <h4>Meeting point</h4>
            <label className="label">Latitude</label>
            <Input
              type="number"
              step="any"
              placeholder="Enter Latitude..."
              value={formData.latitude}
              onChange={handleInputChange}
            />
            <label className="label">Longitude</label>
            <Input
              type="number"
              step="any"
              placeholder="Enter Longitude..."
              value={formData.longitude}
              onChange={handleInputChange}
            />
          </div>

          <Button className="">Save</Button>
        </div>
      </form>
    </section>
  );
};

export default TourDetails;
