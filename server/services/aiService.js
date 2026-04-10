import axios from "axios";

export const getAiItinerary = async (city) => {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/ai/mock-itinerary`,
      {
        city,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Python AI Service unreachable");
  }
};
