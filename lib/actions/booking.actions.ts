'use server'

import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

export const createBooking = async ({ eventId, slug, email }: { eventId: string, slug: string, email: string}) => {
    try {
        await connectToDatabase();
        
        await Booking.create({ eventId, slug, email });

        return { success: true }
    } catch (e) {
        console.log('create booking failed', e);
        return { success: false }
    }
}