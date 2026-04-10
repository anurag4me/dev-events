import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON data format" },
        { status: 400 },
      );
    }

    const file = formData.get("image") as File;

    if (!file)
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 },
      );

    let tags = JSON.parse(formData.get("tags") as string);
    let agenda = JSON.parse(formData.get("agenda") as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // Use direct Cloudinary API upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", new Blob([buffer]), file.name);
      uploadFormData.append(
        "upload_preset",
        process.env.CLOUDINARY_UPLOAD_PRESET || "",
      );
      uploadFormData.append("folder", "DevEvent");

      const uploadResult = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        },
      ).then((res) => res.json());

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

      event.image = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      throw uploadError;
    }

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET(res: NextResponse){
  try {
    await connectToDatabase();
    let events = await Event.find().sort({ createdAt: -1});
    return NextResponse.json({ message: "Events fetched Successfully!", events}, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Event fetching failed", error: e}, { status: 500 })
  }
}