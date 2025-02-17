import "./Homepage.scss";
import Hero from "../../components/Hero/Hero";
import Map from "../../components/Map/Map";
import MoreServices from "../../components/MoreServices/MoreServices";
import Featured from "../../components/Featured/Featured";
import ToursIntroList from "../../components/ToursIntroList/ToursIntroList";
import { useEffect, useState } from "react";
import axios from "axios";

const landmarks = [
  {
    id: 1,
    name: "Hagia Sophia",
    description:
      "A historic Byzantine cathedral turned mosque, now a museum, famous for its massive dome and rich history.",
    latitude: 41.0086,
    longitude: 28.9802,
    category: "Historic",
  },
  {
    id: 2,
    name: "Blue Mosque",
    description:
      "A stunning mosque known for its blue tiles surrounding its interior walls, a popular tourist attraction in the Sultanahmet district.",
    latitude: 41.0055,
    longitude: 28.9768,
    category: "Religious",
  },
  {
    id: 3,
    name: "Topkapi Palace",
    description:
      "The opulent palace of Ottoman sultans, featuring beautiful courtyards, impressive collections, and views of the Bosphorus.",
    latitude: 41.0106,
    longitude: 28.9853,
    category: "Cultural",
  },
  {
    id: 4,
    name: "Basilica Cistern",
    description:
      "An ancient underground water reservoir featuring 336 columns, showcasing Byzantine architecture and eerie lighting.",
    latitude: 41.0084,
    longitude: 28.9777,
    category: "Historic",
  },
  {
    id: 5,
    name: "Galata Tower",
    description:
      "A medieval tower offering panoramic views of the city and the Bosphorus, one of Istanbul's most iconic landmarks.",
    latitude: 41.0256,
    longitude: 28.9744,
    category: "Scenic",
  },
  {
    id: 6,
    name: "Taksim Square",
    description:
      "A central hub for public events, with a monument dedicated to the Turkish Republic and a lively atmosphere.",
    latitude: 41.0369,
    longitude: 28.9853,
    category: "Cultural",
  },
  {
    id: 7,
    name: "Grand Bazaar",
    description:
      "One of the largest and oldest covered markets in the world, featuring thousands of shops selling everything from spices to jewelry.",
    latitude: 41.0106,
    longitude: 28.9597,
    category: "Shopping",
  },
  {
    id: 8,
    name: "Dolmabahce Palace",
    description:
      "A grand palace by the Bosphorus, blending Baroque, Rococo, and Neoclassical styles with a rich history as the administrative center of the Ottoman Empire.",
    latitude: 41.0392,
    longitude: 29.0007,
    category: "Cultural",
  },
  {
    id: 9,
    name: "Süleymaniye Mosque",
    description:
      "An iconic mosque built by the famous architect Mimar Sinan, known for its grand design and location overlooking the Golden Horn.",
    latitude: 41.0169,
    longitude: 28.9652,
    category: "Religious",
  },
  {
    id: 10,
    name: "Bosphorus Bridge",
    description:
      "A remarkable suspension bridge connecting Europe and Asia, offering breathtaking views of Istanbul's skyline.",
    latitude: 41.0705,
    longitude: 29.0412,
    category: "Scenic",
  },
  {
    id: 11,
    name: "Istanbul Modern Art Museum",
    description:
      "A museum dedicated to contemporary art, showcasing works by both Turkish and international artists.",
    latitude: 41.029,
    longitude: 28.9859,
    category: "Cultural",
  },
  {
    id: 12,
    name: "Pierre Loti Hill",
    description:
      "A hill offering a panoramic view of the Golden Horn and the city, named after the French novelist Pierre Loti who frequented the area.",
    latitude: 41.035,
    longitude: 28.9637,
    category: "Scenic",
  },
  {
    id: 13,
    name: "Chora Church",
    description:
      "A Byzantine church known for its stunning mosaics and frescoes depicting scenes from the life of Christ.",
    latitude: 41.0395,
    longitude: 28.9424,
    category: "Religious",
  },
  {
    id: 14,
    name: "Yerebatan Sarnıcı",
    description:
      "An underground cistern built in the 6th century during the Byzantine Empire, known for its Medusa heads and impressive columns.",
    latitude: 41.0084,
    longitude: 28.9777,
    category: "Historic",
  },
  {
    id: 15,
    name: "Bebek Park",
    description:
      "A popular park on the Bosphorus, perfect for a relaxing walk with scenic views of the water and lush greenery.",
    latitude: 41.0609,
    longitude: 29.0391,
    category: "Scenic",
  },
  {
    id: 16,
    name: "Bosphorus Strait",
    description:
      "The narrow waterway that separates the European and Asian sides of Istanbul, known for its breathtaking boat tours and views of Istanbul's historic sites.",
    latitude: 41.0902,
    longitude: 29.0602,
    category: "Scenic",
  },
  {
    id: 17,
    name: "Prince's Islands",
    description:
      "A group of nine islands in the Sea of Marmara, offering scenic views, bike rides, and historical sites, free from motor vehicles.",
    latitude: 40.857,
    longitude: 29.056,
    category: "Scenic",
  },
  {
    id: 18,
    name: "Kadıköy Market",
    description:
      "A bustling market on the Asian side, offering a mix of traditional Turkish goods, food stalls, and artisan shops.",
    latitude: 40.9917,
    longitude: 29.0299,
    category: "Shopping",
  },
  {
    id: 19,
    name: "Istiklal Street",
    description:
      "A popular pedestrian street in Beyoğlu, lined with shops, cafes, and historic buildings, perfect for strolling and people-watching.",
    latitude: 41.0314,
    longitude: 28.9771,
    category: "Cultural",
  },
  {
    id: 20,
    name: "Maiden's Tower",
    description:
      "A small tower on a small islet in the Bosphorus, with legends and historical significance, offering a café and scenic views of Istanbul.",
    latitude: 41.0225,
    longitude: 29.0081,
    category: "Scenic",
  },
];

const Homepage = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours?page=1&limit=3`);
        setTours(response.data);
      } catch (error) {
        console.error("Error fetching tours data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <>
      <Hero />
      <div className="map-heading">
        <h2 className="map-heading__title">Tours Mapped for Your Journey</h2>
        <p className="map-heading__subtitle">
          Explore the map and find must-see spots for your next adventure.
        </p>
      </div>
      <Map tours={tours} landmarks={landmarks} />

      <MoreServices />
      <Featured />
      <ToursIntroList />
    </>
  );
};

export default Homepage;
