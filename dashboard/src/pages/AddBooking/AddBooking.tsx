import { useState } from "react";
import Header from "../../components/Header/Header";
import Icon from "../../components/ui/SVGIcons/Icon";
import {
  chevronDownPath,
  clockPath,
  creditCardPath,
  locationIconPath,
  notesPath,
  personPath,
} from "../../components/ui/SVGIcons/iconPaths";
import BackButton from "../../components/ui/BackButton";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button/Button";
import { useNavigate } from "react-router-dom";

const AddBooking = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    nationality: "",
    email: "",
    phone_number: "",
    tour_id: "",
    number_of_people: 1,
    start_time: "",
    booking_date: "",
    preferred_language: "",
    price_amount: "",
    payment_status: "",
    additional_comments: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Example POST request to your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add booking.");
      }

      // You can handle success here (e.g., redirect or show a success message)
      alert("Booking added successfully!");
    } catch (err) {
      setError("Error adding booking. Please try again.");
    }
  };

  return (
    <section className="w-full h-full bg-gray-50 p-6">
      {/* <Header pageTitle="" /> */}
      <PageHeader title="Add New Booking" />
      <div className="grid lg:grid-cols-3 gap-8 ">
        {error && <p className="text-red-500">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 p-4 bg-white shadow-md rounded-lg "
        >
          <div className="flex items-center gap-2 mb-4">
            <Icon iconPath={personPath} className="mb-1 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground leading-[1] ">
              Customer Information
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="user_name"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                placeholder="Enter customer full name"
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md "
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="nationality"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="e.g., Turkish, American"
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="phone_number"
              >
                Phone Number *
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                placeholder="+90 555 123 4567"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Icon iconPath={locationIconPath} className="mb-1 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground leading-[1] self-center">
              Tour Selection
            </h3>
          </div>
          <div className="mb-8">
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="tour_id"
              >
                Select Tour *
              </label>
              <select
                id="tour_id"
                name="tour_id"
                value={formData.tour_id}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Tour 1</option>
                <option value="2">Tour 2</option>
                <option value="3">Tour 3</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Icon iconPath={clockPath} className="mb-1 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground leading-[1]">
              Tour Details
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="booking_date"
              >
                Tour Date *
              </label>
              <input
                type="date"
                id="booking_date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="start_time"
              >
                Start Time *
              </label>
              <select
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Time 1</option>
                <option value="2">Time 2</option>
                <option value="3">Time 3</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="number_of_people"
              >
                Number of Guests *
              </label>
              <input
                type="number"
                id="number_of_people"
                name="number_of_people"
                value={formData.number_of_people}
                onChange={handleChange}
                required
                min="1"
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="preferred_language"
              >
                Preferred Language
              </label>
              <select
                id="preferred_language"
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              >
                <option value="1">English</option>
                <option value="2">French</option>
                <option value="3">Spanish</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Icon iconPath={creditCardPath} className="mb-1 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground leading-[1]">
              Payment Details
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="payment_method"
              >
                Payment Method *
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Select method</option>
                <option value="2">Cash</option>
                <option value="3">Credit/Debit Card</option>
                <option value="3">Bank Transfer</option>
                <option value="3">PayPal</option>
                <option value="3">Stripe</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="price_amount"
              >
                Amount (€)
              </label>
              <input
                type="text"
                id="price_amount"
                name="price_amount"
                value={formData.price_amount}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="payment_status"
              >
                Payment Status
              </label>
              <select
                id="payment_status"
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                required
                className="w-full h-10 p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Pending</option>
                <option value="2">Paid</option>
                <option value="3">Partial Payment</option>
                <option value="3">Refunded</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 ">
            <Icon iconPath={notesPath} className="mb-1 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground leading-[1]">
              Notes & Special Requests
            </h3>
          </div>
          <div className="mb-8">
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="additional_comments"
              >
                Additional Comments
              </label>
              <textarea
                type="text"
                id="additional_comments"
                name="additional_comments"
                value={formData.additional_comments}
                onChange={handleChange}
                placeholder="Special requests, dietary restrictions, accessibility needs, or
                any other important information..."
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-3 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add Booking
            </Button>

            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 w-full  p-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
        <div className="space-y-6 bg-white shadow-md rounded-lg h-fit">
          <h3 className="text-lg p-6 font-semibold text-foreground leading-[1] ">
            Booking Preview
          </h3>
          <div className="px-6">
            <div>
              <h4 className="font-medium text-sm uppercase tracking-wide">
                Tour
              </h4>
              <p className="font-medium">Princes' Islands Day Trip</p>
              <p className="text-sm">8 hours</p>
            </div>
            <div>
              <h4 className="font-medium text-sm uppercase tracking-wide">
                DETAILS
              </h4>
              <p className="text-sm">1 Guest</p>
            </div>
            <div>
              <h4 className="font-medium text-sm uppercase tracking-wide">
                PRICING
              </h4>
              <div className="flex justify-between text-sm">
                <p>Base price per person</p>
                <span>120</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <h4>Total:</h4>
                <span>120</span>
              </div>
              <div className="flex justify-between text-sm">
                <p>Payment Status:</p>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddBooking;
