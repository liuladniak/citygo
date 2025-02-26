import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import "./Destinations.scss";
import axios from "axios";
import TourCard from "../../components/TourCard/TourCard";
import StoryCard from "../../components/StoryCard/StoryCard";
import StoryCardSmall from "../../components/StoryCard/StoryCardSmall";
import videoExp from "../../assets/videos/story2.mp4";
import videoExp2 from "../../assets/videos/story11.mp4";
import videoExp3 from "../../assets/videos/story18.mp4";
import videoExp4 from "../../assets/videos/story22.mp4";
import videoExp5 from "../../assets/videos/story10.mp4";
import videoExp7 from "../../assets/videos/story12.mp4";
import hamamImg from "../../assets/images/hamam1.jpg";
import imgExp6 from "../../assets/videos/story8.jpg";
import breakfastImg from "../../assets/images/breakfast.jpg";
import imgShopping2 from "../../assets/images/egyptian-bazaar.webp";
import imgShopping3 from "../../assets/images/cukurcuma.webp";
import chooseImg from "../../assets/images/choose-4.jpg";
import VideoComponent from "../../components/VideoComponent/VideoComponent";
import Accordion from "../../components/Accordion/Accordion";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";
import Testimonials from "../../components/Testimonials/Testimonials";
import ToursSkeletonCard from "../../components/LoadingSceleton/ToursSkeletonCard";
import { Link } from "react-router-dom";
const faqs = [
  {
    id: 1,
    question: "What is your refund policy?",
    answer: "Our refund policy allows returns within 30 days of purchase.",
  },
  {
    id: 2,
    question: "How do I change my booking date?",
    answer: "You can change your booking date by contacting our support team.",
  },
  {
    id: 3,
    question: "Do you offer group discounts?",
    answer: "Yes, we offer discounts for groups of 10 or more.",
  },
];

const immersive = [
  {
    id: 1,
    title: "A Sensory Journey: Discover the spices of two continents",
    description: "Discover vibrant spices, teas, and treats to bring home.",
    img: imgShopping2,
  },
  {
    id: 2,
    title: "Full reboot in Hammam, Turkish & Thermal spas",
    description: "Molestias ferendis totam tenetur necessitatibus sunt.",
    img: hamamImg,
  },
  {
    id: 2,
    title:
      "Try iconic breakfast, street food and dinners with the stunning view",
    description: "Molestias ferendis totam tenetur necessitatibus sunt.",
    img: breakfastImg,
  },
];

const Destinations = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [articles, setArticles] = useState([]);
  const [articlesSmall, setArticlesSmall] = useState([]);
  const [error, setError] = useState(null);
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedToursIds = [2, 5, 9];
  const selectedTours = tours.filter((tour) =>
    selectedToursIds.includes(tour.id)
  );
  const romanticToursIds = [2, 6, 8];
  const romanticTours = tours.filter((tour) =>
    romanticToursIds.includes(tour.id)
  );

  useEffect(() => {
    const getToursData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours`);
        const tours = response.data.data;
        setTours(tours);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tours data!", error);
        setIsLoading(false);
      }
    };
    getToursData();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log("Fetching articles");
        const response = await axios.get(
          `${API_URL}/api/articles?limit=9&page=1`
        );
        setArticles(response.data.data.slice(0, 1));
        setArticlesSmall(response.data.data.slice(1, 4));
        console.log(
          "articles response data ARticles SMALL:",
          response.data.data.slice(1, 4)
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError("Failed to load articles");
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="destinations">
      <div className="tours-heading-wrp">
        <div className="tours-type">
          <span>Explore / </span>
          <span>Find tours</span>
        </div>
        <h1 className="tours-heading">Things to do in Istanbul</h1>
        <p className="tours-description">
          Explore Istanbul's vibrant neighborhoods, serene islands, and iconic
          spots. Whether you're seeking history, adventure, or relaxation, our
          curated destinations offer something for everyone. Discover the magic
          of Istanbul, one destination at a time.
        </p>
      </div>

      <div className="destinations-list">
        <h2 className="destinations-heading">Most popular activities</h2>
        <p className="destinations-desc">
          Explore the iconic sights and hidden gems of Istanbul. Whether it's
          your first visit or a return journey, there's always something new to
          discover.
        </p>

        {isLoading ? (
          <div className="tour-cards--skeleton">
            {Array(3)
              .fill()
              .map((_, index) => (
                <ToursSkeletonCard
                  key={index}
                  className="tour-intro-card--skeleton"
                />
              ))}
          </div>
        ) : (
          <div className="destination-cards">
            {selectedTours.map((tour) => (
              <TourCard
                key={tour.id}
                id={tour.id}
                tour_name={tour.tour_name}
                tour_thumbnail={tour.images[0]}
                highlights={tour.highlights}
                duration={tour.duration}
                price={tour.price}
                category={tour.category}
                className="tour-intro-card"
                images={tour.images}
              />
            ))}
          </div>
        )}
        <Link to="/travel-guide" className="destinations-stories">
          <h3 className="destinations-heading">
            Get ideas from latest articles
          </h3>
          <div className="destinations-stories__cols">
            <div className="destinations-stories__col--1">
              <StoryCard article={articles} />
            </div>
            <div className="destinations-stories__col--2">
              {articlesSmall.map((article, index) => (
                <StoryCardSmall
                  key={index}
                  articles={articlesSmall}
                  articleIndex={index}
                />
              ))}
            </div>
          </div>
        </Link>
      </div>

      <div className="destinations-list">
        <h2 className="destinations-heading">Have Immersive Experiences</h2>

        <p className="destinations-desc">
          Delve deeper into Istanbul's rich history and culture with experiences
          that engage all your senses. Get closer to the soul of the city
          through authentic local encounters.
        </p>

        <div className="destination-cards">
          {immersive.map((destination) => (
            <div key={destination.id} className="destination-card">
              <div className="destination-card__img">
                <img
                  src={destination.img}
                  alt={destination.title}
                  loading="lazy"
                />
              </div>
              <div className="overlay--category">
                <h3 className="destination-card__title">{destination.title}</h3>
                <p className="destination-card__desc">
                  {destination.description}
                </p>
                <Button
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn__icon--explore"
                  className="btn--destination-card"
                >
                  Explore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="destinations-contact">
        <h2 className="destinations-heading">
          Here to Help, Whenever You Need
        </h2>
        <p className="destinations-desc">
          We’re here to make your travel planning effortless and enjoyable.
          Whether you’re looking for advice, want to chat about tours, or need
          help tailoring your itinerary, our experienced team is ready to
          assist. Simply here to help you to help you navigate your travel
          choices and find what feels right.
        </p>
        <div className="destinations-contact__options">
          <div className="destinations-contact__option">
            <div className="destinations-contact__icon"></div>
            <h4 className="destinations-contact__title">Call us</h4>
          </div>
          <div className="destinations-contact__option">
            <div className="destinations-contact__icon"></div>
            <h4 className="destinations-contact__title">Send a message</h4>
          </div>
          <div className="destinations-contact__option">
            <div className="destinations-contact__icon"></div>
            <h4 className="destinations-contact__title">On tour support</h4>
          </div>
          <div className="destinations-contact__option">
            <div className="destinations-contact__icon"></div>
            <h4 className="destinations-contact__title">Visit our office</h4>
          </div>
        </div>
      </div>

      <div className="destinations-list romantic">
        <h2 className="destinations-heading">Romantic gateaway & Boat Trips</h2>
        <p className="destinations-desc">
          "Set sail on the Bosphorus and discover Istanbul’s most romantic spots
          from the water. Perfect for couples seeking a serene and unforgettable
          escape.
        </p>

        {isLoading ? (
          <div className="tour-cards--skeleton">
            {Array(3)
              .fill()
              .map((_, index) => (
                <ToursSkeletonCard
                  key={index}
                  className="tour-intro-card--skeleton"
                />
              ))}
          </div>
        ) : (
          <div className="destination-cards">
            {romanticTours.map((tour) => (
              <TourCard
                key={tour.id}
                id={tour.id}
                tour_name={tour.tour_name}
                tour_thumbnail={tour.images[0]}
                highlights={tour.highlights}
                duration={tour.duration}
                price={tour.price}
                category={tour.category}
                className="tour-intro-card"
                images={tour.images}
              />
            ))}
          </div>
        )}
      </div>

      <div className="destinations-own">
        <div className="destinations-own__col destinations-own__col--1">
          <h2 className="destinations-heading">
            You don't have to choose - Create your own itinerary
          </h2>
          <p className="destinations-own__desc">
            Just let us know - we will take care of the rest
          </p>
          <Button className="btn--cta">Learn More</Button>
        </div>
        <div className="destinations-own__col">
          <img src={chooseImg} alt="" loading="lazy" />
        </div>
      </div>

      <Testimonials />
      <div className="destinations-glimpse">
        <h3 className="destinations-heading">
          Glimpse into your next experience
        </h3>
        <h2>Connect with us on our Instagram page #CityGo</h2>
        <div>
          <div className="destinations-img">
            <div className="glimpse-el">
              <img className="glimpse-el" src={imgExp6} alt="" />
            </div>
            <div className="glimpse-el">
              <VideoComponent src={videoExp} speed="1" />
            </div>
            <div className="glimpse-el">
              <VideoComponent src={videoExp2} speed="1" />
            </div>
            <div className="glimpse-el">
              <VideoComponent src={videoExp3} speed="1" />
            </div>
            <div className="glimpse-el--2">
              <VideoComponent src={videoExp4} speed="1" />
            </div>
            <div className="glimpse-el">
              <VideoComponent src={videoExp7} speed="1" />
            </div>
            <div className="glimpse-el">
              <VideoComponent src={videoExp5} speed="2" />
            </div>
          </div>
        </div>
      </div>

      <div className="destinations-faq">
        <h3 className="destinations-heading">FAQ</h3>
        <Accordion items={faqs} />
      </div>
    </div>
  );
};

export default Destinations;
