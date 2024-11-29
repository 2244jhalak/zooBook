"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaFan } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Animal = () => {
  const [isOpen, setIsOpen] = useState(null);
  const closeModal = () => setIsOpen(null);
  const [activeCategory, setActiveCategory] = useState(""); // Tracks the active category
  const [categories, setCategories] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [name, setName] = useState(""); 
  const [animalName, setAnimalName] = useState(""); 
  const [animalCategoryName, setAnimalCategoryName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
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
   
    setLoadingState(true); // Start loading
    setTimeout(() => {
      setLoadingState(false); // End loading
      
  
    }, 2000);
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

  const handleCategory = name => {
    const filter = animals.filter(animal=>animal.animalCategoryName === name)
    setAllAnimals(true);
   
    
      setFilteredAnimals(filter);
   
    
    setActiveCategory(name);
    
  }
  return (
    <div className='pt-20'>
      <div className="flex lg:flex-row md:flex-row flex-col items-center gap-5 justify-between">
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
        {categories.map((category) => (
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
      </div>

      <div className="flex lg:flex-row md:flex-col flex-col items-center gap-5">
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
    <div className='grid lg:grid-cols-6 md:grid-cols-4 grid-cols-2 mx-2 gap-5 mt-12'>
      
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
      {loadingState ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
        </div> // Show loading message
      ) : filteredAnimals.length === 0 ? (
        <div className="text-white text-center">No Data Found</div> // Show "No Data Found" only after loading is complete
      ) : (
        filteredAnimals.map((animal) => (
          <div className="space-y-2" key={animal._id}>
            <div className="border-2 py-12 border-[#141414] rounded-lg flex items-center justify-center">
              <Image
                className="h-20 w-20"
                src={animal.image}
                alt={animal.animalName}
                width={200}
                height={200}
              />
            </div>
            <h4 className="text-white text-center">{animal.animalName}</h4>
          </div>
        ))
      )}
     
    </div>
    </div>
  );
};

export default Animal;
