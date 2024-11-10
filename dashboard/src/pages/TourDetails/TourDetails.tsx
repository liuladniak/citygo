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
const optionsCategory = ["Guided", "Culinary", "Experience"];
const optionsLandmark = ["Center", "Neighborhood"];

const TourDetails = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { slug } = useParams();
  const [adultPrice, setAdultPrice] = useState("");
  const [childPrice, setChildPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("");
  const [overview, setOverview] = useState("");
  const [highlights, setHighlights] = useState<string[]>([
    "Explore local cuisine",
    "Visit historical landmarks",
    "Experience local culture",
  ]);
  const [landmark, setLandmark] = useState("");
  interface Tour {
    tour_name: string;
    images: string[];
    overview: string;
    highlights: string[];
  }
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get<Tour>(`${API_URL}/api/tours/${slug}`);
        console.log(response.data, "response data:");
        setTour(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [slug]);

  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = [...highlights];
    updatedHighlights.splice(index, 1);
    setHighlights(updatedHighlights);
  };

  const handleHighlightChange = (index: number, value: string) => {
    const updatedHighlights = [...highlights];
    updatedHighlights[index] = value;
    setHighlights(updatedHighlights);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!tour) {
    return <div>No tour data found</div>;
  }
  return (
    <section className="tour">
      <div className="tour__header">
        <Link to="/tours" className="icon--arrowBack">
          <img src={arrowBack} alt="arrow back icon" />
        </Link>

        <h1 className="tour__heading">{tour?.tour_name}</h1>
        <Button className="">Save</Button>
      </div>

      <div className="tour__images">
        {tour?.images.map((image, index) => (
          <div key={index} className="tour__image">
            <img
              src={`${API_URL}/${image}`}
              alt={`Image of ${tour.tour_name} ${index + 1}`}
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
              value={adultPrice}
              onChange={(e) => setAdultPrice(e.target.value)}
            />
          </div>

          <div className="tour-details__price">
            <label className="label">Tour price for a child</label>
            <Input
              type="number"
              placeholder="$"
              value={childPrice}
              onChange={(e) => setChildPrice(e.target.value)}
            />
          </div>
          <div className="tour-details__duration">
            <label className="label">Tour Duration</label>
            <Input
              type="number"
              placeholder="hr"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
              placeholder="Select..."
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>
          <div className="tour-details__category">
            <label className="label" htmlFor="category">
              Tour Category
            </label>
            <SelectInput
              options={optionsCategory}
              placeholder="Select..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="tour-details__landmark">
            <label className="label" htmlFor="activity">
              Landmark
            </label>

            <SelectInput
              options={optionsLandmark}
              placeholder="Select landmark..."
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </div>
        </div>
        <div className="tour-details__overview">
          <label className="label" htmlFor="overview">
            Tour Overview
          </label>
          <TextArea
            placeholder={tour.overview}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
          />
        </div>
        <div className="tour-details__highlights">
          <label className="label">Highlights</label>

          <ul className="highlights__list">
            {highlights.map((highlight, index) => (
              <li key={index} className="highlight-item">
                <Input
                  placeholder=""
                  type="text"
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                />
                <Button onClick={() => removeHighlight(index)}>Remove</Button>
              </li>
            ))}
          </ul>
          <Button onClick={addHighlight}>Add Highlight</Button>
        </div>
        <Button className="">Save</Button>
      </div>
    </section>
  );
};

export default TourDetails;
