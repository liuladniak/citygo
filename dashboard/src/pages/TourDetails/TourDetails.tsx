import axios from "axios";
import "./TourDetails.scss";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import arrowBack from "../../assets/icons/arrowBack.svg";

const TourDetails = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { slug } = useParams();

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

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <section className="tour">
      <div className="tour__header">
        <Link to="/tours" className="icon--arrowBack">
          <img src={arrowBack} alt="arrow back icon" />
        </Link>

        <h1 className="tour__heading">{tour?.tour_name}</h1>
        <button>Save</button>
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
            <label>Tour Price for an adult</label>
            <input type="number" placeholder="/adult" />
          </div>

          <div className="tour-details__price">
            <label>Tour Price for a child</label>
            <input type="number" placeholder="/child" />
          </div>

          <div className="tour-details__price">
            <label>Tour Price for an infant</label>
            <input type="number" placeholder="/infant" />
          </div>
        </div>
        <div className="tour-details__duration">
          <label>Tour Duration</label>
          <input type="number" placeholder="hr" />
        </div>
        <div className="tour-details__activity">
          <label htmlFor="activity">Activity level</label>
          <select name="activity" id="activity">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="tour-details__duration">
          <label htmlFor="category">Tour Category</label>
          <select name="category" id="category">
            <option value="culinary">Easy</option>
            <option value="guided">Medium</option>
            <option value="experience">Hard</option>
          </select>
        </div>
        <div className="tour-details__duration">
          <label htmlFor="overview">Tour Overview</label>
          <textarea name="overview" id="overview">
            {tour?.overview}
          </textarea>
        </div>
        <div>
          <h3>Highlights</h3>
          <ul className="highlights__list">
            {tour?.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
        <button>Save</button>
      </div>
    </section>
  );
};

export default TourDetails;
