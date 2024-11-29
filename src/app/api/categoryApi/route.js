
import { connectDB } from "@/app/lib/connectDB";
import { NextResponse } from "next/server";

export const POST = async (request) => {
    const newCategory = await request.json();
    const { name } = newCategory; // Assume categories are identified by "name"

    try {
        const db = await connectDB();
        const categoryCollection = db.collection("category");

        // Check if category already exists
        const exist = await categoryCollection.findOne({ name });
        if (exist) {
            return NextResponse.json(
                { message: "Category Exists" },
                { status: 409 } // Conflict
            );
        }

        // Insert new category
        await categoryCollection.insertOne(newCategory);

        return NextResponse.json(
            { message: "Category Created Successfully" },
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
        const categoryCollection = db.collection("category");

        // Fetch all categories
        const categories = await categoryCollection.find({}).toArray();

        return NextResponse.json(
            { message: "Categories Retrieved", data: categories },
            { status: 200 } // OK
        );
    } catch (error) {
        console.error("Error during fetching categories:", error); // Log the error for debugging
        return NextResponse.json(
            { message: "Something Went Wrong" },
            { status: 500 } // Internal Server Error
        );
    }
};
