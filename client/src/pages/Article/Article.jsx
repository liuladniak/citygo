import { useParams } from "react-router-dom";
import "./Article.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/UI/Loader";

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/articles/${slug}`);
        setArticle(response.data);
        setIsLoading(false);
        console.log("single Article", response.data);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [slug]);

  if (isLoading) {
    return <Loader />;
  }
  return <div>Article {article.title}</div>;
};

export default Article;
