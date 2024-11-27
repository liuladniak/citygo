import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import arrowBack from "../../assets/icons/arrowBack.svg";
import Input from "../../components/ui/Input/Input";
import SelectInput from "../../components/ui/SelectInput/SelectInput";
import Button from "../../components/ui/Button/Button";
import TextArea from "../../components/ui/TextArea/TextArea";
import DeleteIcon from "../../components/ui/SVGIcons/DeleteIcon";
import AddIcon from "../../components/ui/SVGIcons/AddIcon";
import CheckboxList from "../../components/ui/CheckboxList/CheckboxList";
import Header from "../../components/Header/Header";

const optionsActivity = ["Easy", "Medium", "Hard"];
const optionsCategory = ["Guided tour", "Culinary tour", "Experience"];
const optionsLandmark = ["Center", "Neighborhood"];
const optionsAccessibility = [
  "Fully Wheelchair Accessible",
  "Partially accessible",
  "Not Wheelchair Accessible",
  "Audio Guide Available",
  "Sign Language Interpretation Available",
  "No Hearing Assistance Available",
  "Audio-Described Tours Available",
  "Tactile Maps/Guides Available",
  "No Visual Accommodations Available",
  "Elevator/Lift Access Available",
  "Stair-Free Access",
  "Assistance with Mobility Devices Available",
  "Rest Stops/Seating Available",
  "Elderly-Friendly",
  "Family-Friendly",
  "Pet-Friendly",
];

const TourDetails = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  type FormDataType = {
    images: string[];
    tour_name: string;
    price: number;
    duration: string;
    activity_level: string;
    category: string;
    overview_title: string;
    overview: string;
    landmarks: string;
    groups: string;
    minimum_of_attendees: string;
    additional_costs: string;
    start_time: string;
    end_time: string;
    latitude: number;
    longitude: number;
    accessibility: string[];
    highlights: string[];
    essentials: string;
    includes: string;
    available_dates: string[];
  };

  const [formData, setFormData] = useState<FormDataType>({
    images: [],
    available_dates: [],
    tour_name: "",
    price: 0,
    duration: "",
    activity_level: "",
    category: "",
    overview_title: "",
    overview: "",
    landmarks: "",
    groups: "",
    minimum_of_attendees: "",
    additional_costs: "",
    start_time: "",
    end_time: "",
    latitude: 0,
    longitude: 0,
    accessibility: [],
    highlights: [],
    essentials: "",
    includes: "",
  });

  console.log("formData:", formData);

  useEffect(() => {
    const getOneTourData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${slug}`);
        console.log(response.data, "response data:");
        setFormData((prevData) => ({
          ...prevData,
          ...response.data,
          highlights: response.data.highlights || [],
          images: response.data.images || [],
          available_dates: response.data.available_dates || [],
        }));
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTourData();
  }, [slug]);

  const handleInputChange = <K extends keyof FormDataType>(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "price" || name === "groups" || name === "minimum_of_attendees"
        ? parseFloat(value) || 0
        : value;
    setFormData((prevData) => ({
      ...prevData,
      [name as K]: parsedValue,
    }));
  };

  const handleArrayChange = <K extends keyof FormDataType>(
    field: K,
    index: number,
    value: string
  ) => {
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: (prevData[field] as string[]).map((item, i) =>
          i === index ? value : item
        ),
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value;
    setFormData((prevData) => {
      const updatedAccessibility = e.target.checked
        ? [...prevData.accessibility, option]
        : prevData.accessibility.filter((item) => item !== option);

      return {
        ...prevData,
        accessibility: updatedAccessibility,
      };
    });
  };

  const handleAddItem = <K extends keyof FormDataType>(
    field: K,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: [...(prevData[field] as string[]), ""],
      }));
    }
  };

  const handleRemoveItem = <K extends keyof FormDataType>(
    field: K,
    index: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (Array.isArray(formData[field])) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: (prevData[field] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/tours/${slug}`, formData);
      alert("Tour details updated successfully!");
    } catch (error) {
      console.error("Error updating tour details:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <Header pageTitle="Edit Tour" />
      <section className="flex flex-col gap-6 p-6 ">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center">
              <Link to="/tours" className="h-5 w-5 grow-0">
                <img
                  className="h-full w-full object-cover"
                  src={arrowBack}
                  alt="arrow back icon"
                />
              </Link>
              <h1 className="m-4 text-xl font-medium">Edit Tour</h1>
            </div>
            <Button className="w-fit min-w-36 bg-slate-800 text-white grow-0">
              Save
            </Button>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="tour_name"
              className="block text-sm/6 font-semibold text-darkGray "
            >
              Tour Name
            </label>
            <Input
              name="tour_name"
              className="text-base grow max-w-full"
              type="text"
              placeholder="Tour Name"
              value={formData.tour_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-2 mt-6">
            {formData.images.map((image, index) => (
              <div
                key={index}
                className="h-24 w-36 rounded-md overflow-hidden relative"
              >
                <img
                  className="h-full"
                  src={`${API_URL}/${image}`}
                  alt={`Image of ${formData.tour_name} ${index + 1}`}
                />
                {index === 0 && (
                  <div className="absolute bottom-0 right-0 py-1 px-2 bg-lightGray text-darkGray rounded-3xl m-1 text-xs">
                    Main image
                  </div>
                )}
              </div>
            ))}
            <div className="h-24 w-36 rounded-md overflow-hidden border border-dashed border-customBlue flex flex-col gap-2 justify-center items-center text-sm cursor-pointer">
              <span className="text-2xl">+</span>
              <span>Add Image</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <h2 className="text-base font-medium ">Tour Details</h2>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm/6 font-semibold text-darkGray">
                  Tour price for an adult
                </label>
                <Input
                  name="price"
                  type="number"
                  placeholder="$"
                  value={formData.price.toString()}
                  onChange={handleInputChange}
                />
              </div>

              {/* <div className="flex flex-col gap-2 w-full">
              <label className="block text-sm/6 font-medium text-gray-900">
                Tour price for a child
              </label>
              <Input
                name="price_child"
                type="number"
                placeholder="$"
                value={formData.childPrice}
                onChange={handleInputChange}
              />
            </div> */}
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm/6 font-semibold text-darkGray">
                  Tour Duration
                </label>
                <Input
                  name="duration"
                  type="text"
                  placeholder="hr"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="block text-sm/6 font-semibold text-darkGray"
                  htmlFor="activity"
                >
                  Activity level
                </label>

                <SelectInput
                  name="activity_level"
                  options={optionsActivity}
                  placeholder="Activity level..."
                  value={formData.activity_level}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="block text-sm/6 font-semibold text-darkGray"
                  htmlFor="category"
                >
                  Tour Category
                </label>
                <SelectInput
                  name="category"
                  options={optionsCategory}
                  placeholder="Category..."
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="block text-sm/6 font-semibold text-darkGray"
                  htmlFor="activity"
                >
                  Landmark
                </label>

                <SelectInput
                  name="landmarks"
                  options={optionsLandmark}
                  placeholder="Select landmark..."
                  value={formData.landmarks}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full ">
              <label className="block text-sm/6 font-semibold text-darkGray">
                Tour Overiew Title
              </label>
              <Input
                name="overview_title"
                className=""
                type="text"
                placeholder="Overview Title..."
                value={formData.overview_title}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label
                className="block text-sm/6 font-semibold text-darkGray"
                htmlFor="overview"
              >
                Tour Overview
              </label>
              <TextArea
                name="overview"
                placeholder="Tour Overview..."
                value={formData.overview}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="block text-sm/6 font-semibold text-darkGray">
                Highlights
              </label>

              <ul className="list-none p-0">
                {formData.highlights.map((item, index) => (
                  <li key={index} className="flex gap-2.5 items-center mb-2.5">
                    <Input
                      name="highlights"
                      className="grow"
                      placeholder=""
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleArrayChange("highlights", index, e.target.value)
                      }
                    />
                    <Button
                      className="text-slate-600 w-fit min-w-36"
                      onClick={(e) => handleRemoveItem("highlights", index, e)}
                      IconComponent={DeleteIcon}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                IconComponent={AddIcon}
                className="text-slate-600 w-fit min-w-36"
                onClick={(e) => handleAddItem("highlights", e)}
              >
                Add Highlight
              </Button>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                Essentials
              </label>

              <Input
                name="essentials"
                type="text"
                placeholder="Essentials..."
                value={formData.essentials}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                Includes
              </label>

              <Input
                name="includes"
                className=""
                type="text"
                placeholder="Includes..."
                value={formData.includes}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                className="block text-sm/6 font-medium text-gray-900"
                htmlFor="activity"
              >
                Accessibility
              </label>
              <CheckboxList
                options={optionsAccessibility}
                selectedOptions={formData.accessibility}
                onChange={handleCheckboxChange}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <div className="w-full">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Maximum Group size
                </label>
                <Input
                  name="groups"
                  className="max_group"
                  type="text"
                  placeholder="Max group size..."
                  value={formData.groups}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Minimum Group size
                </label>
                <Input
                  name="minimum_of_attendees"
                  type="text"
                  placeholder="Minimum group size..."
                  value={formData.minimum_of_attendees}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <div className="w-full">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Start time
                </label>
                <Input
                  name="start_time"
                  type="time"
                  placeholder="Start time..."
                  value={formData.start_time}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm/6 font-medium text-gray-900">
                  End time
                </label>
                <Input
                  name="end_time"
                  type="time"
                  placeholder="End time..."
                  value={formData.end_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <h4>Meeting point</h4>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Latitude
                  </label>
                  <Input
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="Enter Latitude..."
                    value={formData.latitude.toString()}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Longitude
                  </label>
                  <Input
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="Enter Longitude..."
                    value={formData.longitude.toString()}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="">
              <label className="block text-sm/6 font-medium text-gray-900">
                Additional costs
              </label>
              <Input
                name="additional_costs"
                type="text"
                placeholder="Additional costs..."
                value={formData.additional_costs}
                onChange={handleInputChange}
              />
            </div>

            <Button className="w-fit min-w-36 bg-slate-800 text-white">
              Save
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TourDetails;
