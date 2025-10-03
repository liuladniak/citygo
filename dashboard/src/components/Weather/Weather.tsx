import { useState, useEffect } from "react";
import "./Weather.scss";

interface WeatherData {
  current: {
    temperature_2m: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

const WEATHER_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  80: "🌦️",
  81: "🌧️",
  82: "🌧️",
  95: "⛈️",
};

interface WeatherProps {
  lat?: string;
  lon?: string;
}

const Weather: React.FC<WeatherProps> = ({
  lat = "41.025658",
  lon = "28.974155",
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=41.025658&longitude=28.974155&current=temperature_2m,is_day,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&meteofrance_seamless`
        );

        console.log(response);
        const data: WeatherData = await response.json();
        console.log("Data:", data);
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (loading) return <p>Loading weather...</p>;
  if (!weather) return <p>Weather data not available.</p>;

  return (
    <div className="weather p-6">
      <div className="weather-current">
        <h2>Current Weather: </h2>
        <p>
          {WEATHER_ICONS[weather.current.weathercode] || "❓"}{" "}
          {Math.round(weather.current.temperature_2m)}°C
        </p>
      </div>

      {/* <h3>7-Day Forecast</h3> */}
      <div className="forecast">
        {weather.daily.time.map((date, index) => (
          <div key={index} className="day">
            <p>
              {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
            </p>
            <p>{WEATHER_ICONS[weather.daily.weathercode[index]] || "❓"}</p>
            <p>
              {Math.round(weather.daily.temperature_2m_max[index])}°
              {/* /{" "} */}
              {/* {weather.daily.temperature_2m_min[index]}° */}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;
