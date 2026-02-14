import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import arrowBack from "../../assets/icons/arrowBack.svg";
import Input from "../../components/ui/Input/Input";
import SelectInput from "../../components/ui/SelectInput/SelectInput";
import Button from "../../components/ui/CustomButton/CustomButton";
import TextArea from "../../components/ui/TextArea/TextArea";
import DeleteIcon from "../../components/ui/SVGIcons/DeleteIcon";
import AddIcon from "../../components/ui/SVGIcons/AddIcon";
import CheckboxList from "../../components/ui/CheckboxList/CheckboxList";
import { CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

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

const AddTour = () => {
  type PreviewImage = {
    file: File;
    previewUrl: string;
  };
  const API_URL = import.meta.env.VITE_API_KEY;
  const [images, setImages] = useState<PreviewImage[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    console.log("Selected files:", selectedFiles);
    const newImages = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleImageRemove = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      if (prevImages[index]) {
        URL.revokeObjectURL(prevImages[index].previewUrl);
      }
      return updatedImages;
    });
  };

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [images]);

  type FormDataType = {
    images: File[];
    tour_name: string;
    price: number;
    duration: string;
    slug: string;
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
    available_dates: ["2024-11-21", "2024-11-23", "2024-11-24"],
    tour_name: "",
    price: 0,
    duration: "",
    slug: "islands",
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
    latitude: 41.015137,
    longitude: 28.97953,
    accessibility: [],
    highlights: [],
    essentials: "",
    includes: "",
  });

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
  console.log(formData);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("tour_name", formData.tour_name);
    formDataToSend.append("price", formData.price.toString());
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("activity_level", formData.activity_level);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("overview_title", formData.overview_title);
    formDataToSend.append("overview", formData.overview);
    formDataToSend.append("landmarks", formData.landmarks);
    formDataToSend.append("groups", formData.groups);
    formDataToSend.append(
      "minimum_of_attendees",
      formData.minimum_of_attendees
    );
    formDataToSend.append("additional_costs", formData.additional_costs);
    formDataToSend.append("essentials", formData.essentials);
    formDataToSend.append("includes", formData.includes);
    formDataToSend.append("start_time", formData.start_time);
    formDataToSend.append("end_time", formData.end_time);
    formDataToSend.append("latitude", formData.latitude.toString());
    formDataToSend.append("longitude", formData.longitude.toString());
    const accessibilityString = formData.accessibility.join(", ");
    formDataToSend.append("accessibility", accessibilityString);
    formData.highlights.forEach((highlight) => {
      formDataToSend.append("highlights[]", highlight);
    });
    console.log("*****IMGES:", images);
    images.forEach(({ file }) => {
      formDataToSend.append("images", file);
    });
    try {
      console.log("FORM DATA:", formDataToSend, formData);
      await axios.post(`${API_URL}/api/tours`, formDataToSend);
      alert("Tour added successfully!");
    } catch (error) {
      console.error("Error adding tour ", error);
    }
  };

  return (
    <div>
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Add New Tour</CardTitle>
      </CardHeader>
      <section className="flex flex-col gap-6 p-6 ">
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          action="post"
        >
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center">
              <Link to="/tours" className="h-5 w-5 grow-0">
                <img
                  className="h-full w-full object-cover"
                  src={arrowBack}
                  alt="arrow back icon"
                />
              </Link>
              <h1 className="m-4 text-xl font-semibold text-dark-gray">
                Add New Tour
              </h1>
            </div>
            <Button className="w-fit min-w-36 bg-slate-800 text-white grow-0">
              Save
            </Button>
          </div>
          <div className="flex flex-col gap-2 ">
            <label
              htmlFor="tour_name"
              className="block text-sm/6 font-bold text-gray-900 "
            >
              Tour Name
            </label>
            <Input
              name="tour_name"
              className="text-base"
              type="text"
              placeholder="Tour Name"
              value={formData.tour_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-2 mt-6">
            <div className="flex gap-4 mt-4 flex-wrap">
              {images &&
                images.map((image, index) => {
                  console.log("Index: " + index);
                  return (
                    <div
                      key={image.previewUrl}
                      className="h-24 w-36 rounded-md border"
                    >
                      <img
                        src={image.previewUrl}
                        alt="Tour image"
                        className="h-full w-full object-cover"
                      />
                      <button
                        className="text-black bg-red-500"
                        onClick={() => handleImageRemove(index)}
                      >
                        Delete image
                      </button>
                    </div>
                  );
                })}
            </div>
            <div className="h-24 w-36 rounded-md overflow-hidden border border-dashed border-custom-blue flex flex-col gap-2 justify-center items-center text-sm cursor-pointer">
              <label className="cursor-pointer flex flex-col">
                <span className="text-2xl">+</span>
                Add Image
                <span>up to 10 images</span>
                <input
                  className="hidden"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <h2 className="text-base font-medium">Tour Details</h2>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm/6 font-semibold text-dark-gray ">
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

              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm/6 font-medium text-gray-900">
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
                  className="block text-sm/6 font-medium text-gray-900"
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
                  className="block text-sm/6 font-medium text-gray-900"
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
                  className="block text-sm/6 font-medium text-gray-900"
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
              <label className="block text-sm/6 font-medium text-gray-900">
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
                className="block text-sm/6 font-medium text-gray-900"
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
              <label className="block text-sm/6 font-medium text-gray-900">
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

export default AddTour;
