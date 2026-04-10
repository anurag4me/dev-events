import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse>{
    try {
        await connectToDatabase();
        const {slug} = await params;

        if(!slug || typeof slug != 'string' || slug.trim() == ''){
            return NextResponse.json(
                { message: 'Invalid or missing slug parameter'},
                { status: 400 }
            );
        }

        let sanitizedSlug = slug.trim().toLowerCase();

        const event = await Event.findOne({ slug: sanitizedSlug }).lean();

        if(!event) {
           return NextResponse.json(
                { message: `Event with slug ${sanitizedSlug} not found`},
                { status: 404 }
            ); 
        }

        return NextResponse.json({ message: "Event fetched Successfully!", event}, { status: 200 });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching event by slug', e);
    }

    if(e instanceof Error) {
        if(e.message.includes('MONGODB_URI')) {
            return NextResponse.json(
                { message: 'Database configuration error'},
                { status: 500}
            );
        }
    }
    return NextResponse.json({ message: "An unexpected error occurred"}, { status: 500 })
  }
}