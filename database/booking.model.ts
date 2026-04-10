import mongoose, { Model, Schema, Types } from "mongoose";
import { Event } from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.pre("save", async function (next) {
  try {
    // Normalize and verify email before persisting.
    const normalizedEmail = this.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error("Invalid email format.");
    }
    this.email = normalizedEmail;

    // Guard referential integrity by ensuring the target event exists.
    if (this.isNew || this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId });
      if (!eventExists) {
        throw new Error("Referenced event does not exist.");
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
