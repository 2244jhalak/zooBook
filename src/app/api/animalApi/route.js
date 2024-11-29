
import { connectDB } from "@/app/lib/connectDB";
import { NextResponse } from "next/server";

export const POST = async (request) => {
    const newAnimal = await request.json();
    const { animalName } = newAnimal; // Assume categories are identified by "name"

    try {
        const db = await connectDB();
        const animalCollection = db.collection("animal");

        // Check if category already exists
        const exist = await animalCollection.findOne({ animalName });
        if (exist) {
            return NextResponse.json(
                { message: "Category Exists" },
                { status: 409 } // Conflict
            );
        }

        // Insert new category
        await animalCollection.insertOne(newAnimal);

        return NextResponse.json(
            { message: "Animal Created Successfully" },
            { status: 201 } // Created
        );
    } catch (error) {
        console.error("Error during category creation:", error); // Log the error for debugging
        return NextResponse.json(
            { message: "Something Went Wrong" },
            { status: 500 } // Internal Server Error
        );
    }
};

export const GET = async () => {
    try {
        const db = await connectDB();
        const animalCollection = db.collection("animal");

        // Fetch all categories
        const animals = await animalCollection.find({}).toArray();
        console.log(animals);

        return NextResponse.json(
            { message: "Categories Retrieved", data: animals },
            { status: 200 } // OK
        );
    } catch (error) {
        console.error("Error during fetching animals:", error); // Log the error for debugging
        return NextResponse.json(
            { message: "Something Went Wrong" },
            { status: 500 } // Internal Server Error
        );
    }
};