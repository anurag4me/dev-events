import mongoose, { Model, Schema } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}


const REQUIRED_STRING_FIELDS: Array<keyof Pick<
  IEvent,
  | "title"
  | "description"
  | "overview"
  | "image"
  | "venue"
  | "location"
  | "date"
  | "time"
  | "mode"
  | "audience"
  | "organizer"
>> = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "date",
  "time",
  "mode",
  "audience",
  "organizer",
];

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeDateToIso = (value: string): string => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format.");
  }
  return parsedDate.toISOString();
};

const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  const twentyFourHourMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (twentyFourHourMatch) {
    const hours = twentyFourHourMatch[1].padStart(2, "0");
    const minutes = twentyFourHourMatch[2];
    return `${hours}:${minutes}`;
  }

  const twelveHourMatch = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([aApP][mM])$/.exec(
    trimmed
  );
  if (!twelveHourMatch) {
    throw new Error("Invalid time format. Use HH:mm or h:mm AM/PM.");
  }

  let hours = Number(twelveHourMatch[1]);
  const minutes = twelveHourMatch[2];
  const period = twelveHourMatch[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be either online, offline, or hybrid',
      },
    },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item.trim().length > 0),
        message: "Agenda must contain at least one non-empty item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item.trim().length > 0),
        message: "Tags must contain at least one non-empty item.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

eventSchema.pre("save", function (next) {
  try {
    // Ensure all required string fields are present and not blank.
    for (const field of REQUIRED_STRING_FIELDS) {
      const value = this[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${field} is required and cannot be empty.`);
      }
      this[field] = value.trim();
    }

    // Normalize array values so empty strings cannot be persisted.
    this.agenda = this.agenda.map((item) => item.trim()).filter(Boolean);
    this.tags = this.tags.map((item) => item.trim()).filter(Boolean);
    if (this.agenda.length === 0 || this.tags.length === 0) {
      throw new Error("Agenda and tags must each contain at least one value.");
    }

    // Regenerate slug only when title changes.
    if (this.isModified("title")) {
      this.slug = slugify(this.title);
    }

    // Persist date/time in consistent machine-friendly formats.
    this.date = normalizeDateToIso(this.date);
    this.time = normalizeTime(this.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema);

export default Event;