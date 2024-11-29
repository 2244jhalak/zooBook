"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaFan } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Animal = () => {
  const [isOpen, setIsOpen] = useState(null);
  const closeModal = () => setIsOpen(null);

  const [visibleButtons, setVisibleButtons] = useState([]); 
  const [startIndex, setStartIndex] = useState(0); 
  const maxVisibleButtons = 6; 
  const [activeCategory, setActiveCategory] = useState(""); // Tracks the active category
  const [categories, setCategories] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [name, setName] = useState(""); 
  const [animalName, setAnimalName] = useState(""); 
  const [animalCategoryName, setAnimalCategoryName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [allAnimals, setAllAnimals] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/categoryApi`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/animalApi`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAnimals(data.data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/categoryApi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      await fetchCategories();

      if (response.ok) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Category has been saved",
          showConfirmButton: false,
          timer: 1500,
        });
        setName(""); 
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Something Went Wrong",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Something Went Wrong",
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalSubmit = async (e) => {
    e.preventDefault();
    const photo = e.target.photo.files[0];

    setLoading(true);

    try {
      // 1. Create FormData for file upload
      const formData = new FormData();
      formData.append("image", photo);

      // 2. Upload image via imgbb API
      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const imgbbData = await imgbbResponse.json();

      if (imgbbData.success) {
        const image = imgbbData.data.url;

        // 3. Send user info to MongoDB with photo URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/animalApi`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ animalName, animalCategoryName, image }),
          }
        );

        if (response.ok) {
          
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Animal Created Successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          window.location.reload();
          
        } else {
          
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Something Went Wrong",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Photo Upload Failed",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Something Went Wrong",
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  } 

  const handleNext = () => {
    const nextIndex = startIndex + 1;
    if (nextIndex + maxVisibleButtons <= categories.length) {
      setStartIndex(nextIndex);
      setVisibleButtons(categories.slice(nextIndex, nextIndex + maxVisibleButtons));
    }
  };

  const handlePrev = () => {
    const prevIndex = startIndex - 1;
    if (prevIndex >= 0) {
      setStartIndex(prevIndex);
      setVisibleButtons(categories.slice(prevIndex, prevIndex + maxVisibleButtons));
    }
  };

  useEffect(() => {
    setVisibleButtons(categories.slice(startIndex, startIndex + maxVisibleButtons));
  }, [categories, startIndex]);

  const handleCategory = name => {
    const filter = animals.filter(animal=>animal.animalCategoryName === name)
    setAllAnimals(true);
    setFilteredAnimals(filter);
    setActiveCategory(name);
    
  }
  return (
    <div className='pt-20'>
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-5 mb-4">
        {/* Show the previous and next buttons only if there are more than 4 categories */}
        {categories.length > maxVisibleButtons && (
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className={`px-5 py-3 rounded-full ${startIndex === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white"}`}
          >
            <FaArrowLeft />
          </button>
        )}

        {visibleButtons.map((category) => (
          <button
            key={category._id}
            onClick={()=>handleCategory(category.name)}
          
            className={`px-8 py-3 rounded-3xl border-2 ${
              activeCategory === category.name
                ? "bg-black text-[#058F34] border-[#058F34]" // Active button styles
                : "bg-black text-[#EF0D0D] border-[#EF0D0D]" // Default styles
            }`}
          >
            {category.name}
          </button>
        ))}

        {categories.length > maxVisibleButtons && (
          <button
            onClick={handleNext}
            disabled={startIndex + maxVisibleButtons >= categories.length}
            className={`p-2 rounded-full ${startIndex + maxVisibleButtons >= categories.length ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white"}`}
          >
            <FaArrowRight />
          </button>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => setIsOpen('animal')}
          className="bg-black text-white border-2 border-white rounded-3xl px-8 py-3"
        >
          Add Animal
        </button>

        <button
          onClick={() => setIsOpen('category')}
          className="bg-black text-white border-2 border-white rounded-3xl px-5 py-3"
        >
          Add Category
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="relative z-50 px-8 py-10 bg-white rounded-3xl shadow-lg w-11/12 sm:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            {isOpen === 'animal' ? (
              <>
                <h2 className="text-lg font-bold">Add Animal</h2>
                <form onSubmit={handleAnimalSubmit} className="space-y-2">
              <div>
                <input
                  type="text"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  placeholder="Name"
                  className="w-full mt-1 p-2 border border-[#FFFFFF] bg-[#F2F2F2] rounded-lg mb-2"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={animalCategoryName}
                  onChange={(e) => setAnimalCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full mt-1 p-2 border border-[#FFFFFF] bg-[#F2F2F2] rounded-lg mb-2"
                  required
                />
              </div>
              <div>
                <input
                  type="file"
                  name="photo"
                  placeholder="Image"
                  className="w-full mt-1 p-2 border border-[#FFFFFF] bg-[#F2F2F2] rounded-lg mb-2"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white rounded-lg ${loading ? "bg-[#141414] cursor-not-allowed" : "bg-[#000000] hover:bg-[#141414]"}`}
                disabled={loading}
              >
                {loading ? <div className="flex items-center justify-center py-1"><FaFan className="animate-spin" /></div> : "Create Animal"}
              </button>
            </form>
                
              </>
            ) : isOpen === 'category' ? (
              <>
                <h2 className="text-lg font-bold mb-2">Add Category</h2>
                <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full mt-1 p-2 border border-[#FFFFFF] bg-[#F2F2F2] rounded-lg mb-2"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white rounded-lg ${loading ? "bg-[#141414] cursor-not-allowed" : "bg-[#000000] hover:bg-[#141414]"}`}
                disabled={loading}
              >
                {loading ? <div className="flex items-center justify-center py-1"><FaFan className="animate-spin" /></div> : "Save"}
              </button>
            </form>
              </>
            ) : null}

            
          </div>
        </div>
      )}
    </div>
    <div className='grid grid-cols-6 gap-5 mt-12'>
      
        {
          animals.map
          (
            animal=>
          <div className={`${allAnimals? "hidden" : "space-y-2"}`} key={animal._id}>
            <div className='border-2 py-10 border-[#141414] rounded-lg flex items-center justify-center'>
               <Image className='h-28 w-28' src={animal.image} alt='' width={200} height={200}></Image>
            </div>
            <h4 className='text-white text-center'>{animal.animalName}</h4>
          </div>
          ) 
        }
        {
          filteredAnimals.map
          (
            animal=>
          <div className="space-y-2" key={animal._id}>
            <div className='border-2 py-12 border-[#141414] rounded-lg flex items-center justify-center'>
               <Image className='h-20 w-20' src={animal.image} alt='' width={200} height={200}></Image>
            </div>
            <h4 className='text-white text-center'>{animal.animalName}</h4>
          </div>
          ) 
        }
     
    </div>
    </div>
  );
};

export default Animal;
