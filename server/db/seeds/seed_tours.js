/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("tours").del();

  await knex("tours").insert([
    {
      tour_name: "Historical Istanbul Walking Tour",
      duration: "4 hr",
      category: "Guided tour",
      landmarks: "Center",
      price: 50.0,
      activity_level: "Moderate",
      overview_title: "A Journey Through Time",
      overview:
        "Immerse yourself in the rich history of Istanbul with this comprehensive walking tour. Visit iconic landmarks such as the Hagia Sophia, Blue Mosque, and Topkapi Palace. Discover the stories and secrets behind these architectural marvels with our expert guide. The tour also includes a stroll through the bustling Grand Bazaar, where you can experience the vibrant atmosphere and find unique souvenirs. This tour is perfect for history enthusiasts and those looking to gain a deeper understanding of Istanbul's cultural heritage.",
      essentials: "Comfortable walking shoes, water, sunscreen",
      includes: "Entrance fees, guided tour, bottled water",
      accessibility: "Partially accessible",
      groups: 15,
      minimum_of_attendees: 2,
      additional_costs: "Lunch not included",
      start_time: "09:00",
      end_time: "13:00",
      longitude: 28.9784,
      latitude: 41.0082,
    },
    {
      tour_name: "Bosphorus Cruise and Spice Market Tour",
      duration: "6 hr",
      category: "Guided tour",
      landmarks: "Center",
      price: 70,
      activity_level: "Easy",
      overview_title: "Embrace the Enchanting Bosphorus and Bustling Markets",
      overview:
        "Experience the enchanting beauty of Istanbul from the water with our Bosphorus Cruise. This tour combines a scenic cruise along the Bosphorus Strait with a visit to the vibrant Spice Market. Admire the stunning views of Istanbul's skyline, the majestic palaces, and historic fortresses along the shores. At the Spice Market, indulge your senses with the exotic aromas and colorful displays of spices, herbs, and local delicacies. This tour offers a perfect blend of relaxation and cultural immersion, ideal for families and couples.",
      essentials: "Hat, sunglasses, camera",
      includes: "Cruise ticket, guided tour, snacks",
      accessibility: "Fully accessible",
      groups: 20,
      minimum_of_attendees: 4,
      additional_costs: "Personal shopping",
      start_time: "10:00",
      end_time: "16:00",
      longitude: 28.9802,
      latitude: 41.0136,
    },
    {
      tour_name: "Istanbul Food and Culture Tour",
      category: "Culinary tour",
      duration: "5 hr",
      landmarks: "Neighborhood",
      price: 60,
      activity_level: "Easy",
      overview_title: "A Taste of Istanbul: Culinary and Cultural Delights",
      overview:
        "Dive into the culinary delights and cultural heritage of Istanbul with this food and culture tour. Taste a variety of Turkish delicacies, from savory kebabs to sweet Turkish delights, as you explore local eateries and markets. Along the way, learn about the history and traditions that have shaped Istanbul's vibrant food scene. This tour is perfect for food enthusiasts and anyone looking to experience the authentic flavors of Istanbul. Enjoy a day filled with delicious food, cultural insights, and memorable experiences.",
      essentials: "Appetite, comfortable clothes",
      includes: "Food samples, guided tour, tea",
      accessibility: "Fully accessible",
      groups: 10,
      minimum_of_attendees: 3,
      additional_costs: "Extra food and drinks",
      start_time: "11:00",
      end_time: "16:00",
      longitude: 28.9486,
      latitude: 41.0277,
    },
    {
      tour_name: "Historical Gems of Istanbul Tour",
      duration: "4 hr",
      category: "Guided tour",
      landmarks: "Center",
      price: 60,
      activity_level: "Easy",
      overview_title: "Istanbul's Hidden Treasures: A Walking Tour",
      overview:
        "Immerse yourself in the historical and cultural treasures of Istanbul with our Historical Gems Tour. This tour includes visits to the iconic Basilica Cistern, the serene Gülhane Park, and the renowned Istanbul Archaeological Museums. Discover the rich heritage and fascinating stories behind these landmarks with our expert guide.",
      essentials: "Water, comfortable walking shoes, camera",
      includes: "Entrance fees, guided tour",
      accessibility: "Fully accessible",
      groups: 15,
      minimum_of_attendees: 2,
      additional_costs: "Personal expenses, snacks and drinks",
      start_time: "13:00",
      end_time: "17:00",
      longitude: 28.977,
      latitude: 41.0126,
    },
    {
      tour_name: "Galata Beyoglu Historical and Cultural Tour",
      duration: "4 hr",
      category: "Guided tour",
      landmarks: "Center",
      price: 70,
      activity_level: "Easy",
      overview_title: "A Walk Through History and Culture",
      overview:
        "Discover the rich history and vibrant culture of Istanbul's Galata Beyoglu district with our guided tour. Start at the iconic Galata Tower and explore the narrow, cobblestone streets filled with historic landmarks, charming cafes, and art galleries. Learn about the area's fascinating past and present as you visit significant sites and hidden gems. This tour is perfect for history buffs, culture enthusiasts, and anyone looking to experience the unique charm of Galata Beyoglu.",
      essentials: "Comfortable walking shoes, camera",
      includes: "Entry fees, guided tour",
      accessibility: "Partially accessible",
      groups: 20,
      minimum_of_attendees: 4,
      additional_costs: "Food and beverages at cafes",
      start_time: "09:00",
      end_time: "13:00",
      longitude: 28.9768,
      latitude: 41.0255,
    },
    {
      tour_name: "Fener-Balat Historical Walking Tour",
      duration: "4 hr",
      category: "Guided tour",
      landmarks: "Neighborhood",
      price: 50,
      activity_level: "Moderate",
      overview_title: "Explore Vibrant Neighborhoods",
      overview:
        "Discover the rich history and vibrant culture of the Fener and Balat neighborhoods in Istanbul. This walking tour takes you through the narrow streets filled with colorful houses, historic churches, and bustling markets. Learn about the diverse communities that have called this area home for centuries, and enjoy a taste of local life with stops at traditional cafes and shops.",
      essentials: "Comfortable walking shoes, water bottle, camera",
      includes: "Guided tour,  coffee or tea at local cafe",
      accessibility: "Not accessible",
      groups: 12,
      minimum_of_attendees: 2,
      additional_costs: "Snacks and drinks",
      start_time: "10:00",
      end_time: "14:00",
      longitude: 28.9497,
      latitude: 41.0291,
    },
    {
      tour_name: "Istanbul Shopping Tour",
      duration: "6 hr",
      category: "Experience",
      landmarks: "Center",
      price: 55,
      activity_level: "Easy",
      overview_title: "Shop Till You Drop: Istanbul's Best Shopping Spots",
      overview:
        "Discover the best shopping spots in Istanbul with our guided tour. From the historic Grand Bazaar and Spice Market to modern shopping centers like Istinye Park and trendy boutiques in Nişantaşı, this tour offers a diverse shopping experience. Whether you're looking for unique souvenirs, fashion items, or local delicacies, our expert guide will help you navigate Istanbul's bustling markets and shopping districts. Perfect for shoppers and fashion enthusiasts.",
      essentials: "Comfortable shoes, cash/card",
      includes: "Guided tour, shopping tips",
      accessibility: "Fully accessible",
      groups: 10,
      minimum_of_attendees: 3,
      additional_costs: "Personal shopping",
      start_time: "10:00",
      end_time: "16:00",
      longitude: 28.9743,
      latitude: 41.01,
    },
    {
      tour_name: "Istanbul Art and Culture Tour",
      duration: "5 hr",
      category: "Experience",
      landmarks: "Center",
      price: 65,
      activity_level: "Easy",
      overview_title: "Discover Istanbul's Artistic and Cultural Heritage",
      overview:
        "Explore Istanbul's rich art and cultural heritage with our art and culture tour. Visit renowned museums and galleries, including Istanbul Modern, Pera Museum, and SALT Galata. Our expert guide will provide insights into the city's artistic and cultural evolution, highlighting significant works and exhibitions. This tour is ideal for art lovers and culture enthusiasts looking to deepen their appreciation of Istanbul's creative landscape.",
      essentials: "Notebook, camera",
      includes: "Entrance fees, guided tour",
      accessibility: "Fully accessible",
      groups: 12,
      minimum_of_attendees: 2,
      additional_costs: "Souvenirs",
      start_time: "11:00",
      end_time: "16:00",
      longitude: 28.9734,
      latitude: 41.0292,
    },
    {
      tour_name: "Istanbul Photography Tour",
      duration: "4 hr",
      category: "Experience",
      landmarks: "Neighborhood",
      price: 75,
      activity_level: "Moderate",
      overview_title: "Photography Tour for Capturing Your Memories",
      overview:
        "Capture the beauty of Istanbul with our guided photography tour. Visit some of the city's most photogenic locations, including Galata Tower, the Bosphorus, Suleymaniye Mosque, and the colorful streets of Balat. Our professional guide will provide photography tips and help you find the best angles and lighting. This tour is perfect for photography enthusiasts of all levels looking to improve their skills and take stunning photos of Istanbul.",
      essentials: "Camera, comfortable shoes",
      includes: "Guided tour, photography tips",
      accessibility: "Partially accessible",
      groups: 10,
      minimum_of_attendees: 2,
      additional_costs: "Personal expenses",
      start_time: "09:00",
      end_time: "13:00",
      longitude: 28.9764,
      latitude: 41.0304,
    },
    {
      tour_name: "Golden Horn Adventure Tour",
      duration: "6 hr",
      category: "Guided tour",
      landmarks: "Neighborhood",
      price: 80,
      activity_level: "Hard",
      overview_title: "Discover the Beauty of the Golden Horn",
      overview:
        "Experience the enchanting Golden Horn region of Istanbul with our guided adventure tour. Begin your journey with a scenic climb to Pierre Loti Hill, where you can enjoy stunning panoramic views of the city. Continue exploring historic landmarks and vibrant neighborhoods along the Golden Horn. This tour combines moderate physical activity with rich cultural insights, making it perfect for those looking to delve deeper into Istanbul's charm.",
      essentials: "Comfortable walking shoes, water, sunscreen, camera",
      includes: "Entrance fees, guided tour, bottled water",
      accessibility: "Partially accessible",
      groups: 15,
      minimum_of_attendees: 3,
      additional_costs: "Lunch not included",
      start_time: "08:00",
      end_time: "14:00",
      longitude: 28.9322,
      latitude: 41.042,
    },
  ]);
}
