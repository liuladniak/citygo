# Project Title

isTour

## Overview

isTour is a web application designed for booking city tours across Türkiye. It provides users with a seamless experience to discover, book, and enjoy guided tours in various cities within the country.

### Problem

Tourists and locals often face difficulties in finding reliable and interesting city tours that meet their preferences. Information on available tours can be scattered, inconsistent, and often lacks user-friendly booking options. isTour addresses these pain points by consolidating tour options, providing detailed information, and offering a convenient booking system.

### User Profile

- Tourists:
  - Looking to explore different cities in Türkiye.
  - Seeking reliable tour options.
  - Wanting to book tours easily online.
- Local residents:
  - Interested in discovering hidden gems in their own city or nearby cities.
  - Looking for curated tour experiences.
- Tour operators:
  - Offering city tours and seeking a platform to reach a wider audience.
  - Needing an easy-to-manage booking system.

### Features

- Tour Listings

  - As a user, I want to browse available city tours in different cities.
  - As a user, I want to filter tours based on location, duration, and price.

- Tour Details

  - As a user, I want to view detailed information about each tour, including itinerary
  - As a user, I want to view the available tour dates;

## Implementation

### Tech Stack

- Frontend:

  - React
  - react-router
  - axios

- Backend:

  - Node.js
  - Express
    MySQL
    knex

### APIs:

Map API
Calendar API
Weather API

### Sitemap

- Home Page:

  - Overview of available tours and highlights.

- All Tours Page:

  - Filterable list of tours by city, date, and other criteria.

- Tour Details Page:
  - Detailed information about a selected tour, including itinerary

### Mockups

#### Home Page

![](home.png)

#### All Tours Page

![](view-cafes.png)

#### Tour Details Page

![](view-cafe.png)

### Data

Tours:

Tour ID
City
Tour Name
Description
Itinerary
Duration
Price

### Endpoints

**GET /tours**

- Fetch list of tours with optional filters for city, date, duration, and price.

**GET /tours/:id**

- Fetch detailed information for a specific tour by ID.

### Roadmap

Sprint 1:

Set up project structure for frontend and backend.
Implement basic routing and layout for the frontend.
Set up database and create initial data models.

Sprint 2:

Develop tour listing and detail pages.
Integrate API for displaying tour details.
Create endpoints for fetching tours and handling bookings.

Sprint 3:

Conduct user testing and gather feedback.
Optimize and debug the application.

## Nice-to-haves

- Authentication and authorization
- Creating booking checkout and creating a booking listing
- Manage my bookings functionality
- Subscribe to newsletter
- Loyalty programs and special discounts for frequent users.
