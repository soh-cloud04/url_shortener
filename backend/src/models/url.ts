import mongoose, { Document, Schema } from 'mongoose';

export interface IUrl extends Document {
    longUrl: string;
    shortCode: string;
    createdAt: Date;
    clicks: number;
    salt?: number;
}

const urlSchema = new Schema<IUrl>({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        auto: false
    },
    longUrl: {
        type: String,
        required: true,
        trim: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    clicks: {
        type: Number,
        default: 0
    },
    salt: {
        type: Number,
        required: false
    }
});

// Create index for faster queries
urlSchema.index({ shortCode: 1 });

export const Url = mongoose.model<IUrl>('Url', urlSchema);

export const generateUniqueId = () => {
    return new mongoose.Types.ObjectId();
}