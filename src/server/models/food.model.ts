import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFoodServing {
  labelBn: string;
  labelEn: string;
  grams: number;
}

export interface IFoodPer100g {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  potassium?: number;
  zinc?: number;
  iron?: number;
  calcium?: number;
  sodium?: number;
}

export interface IFood extends Document {
  nameBn: string;
  nameEn: string;
  aliases: string[];
  category:
    | 'grains'
    | 'lentils'
    | 'fish'
    | 'poultry_meat'
    | 'eggs_dairy'
    | 'vegetables_bhorta'
    | 'fruits'
    | 'snacks_beverages';
  image?: string;
  per100g: IFoodPer100g;
  servings: IFoodServing[];
  source: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodServingSchema = new Schema<IFoodServing>(
  {
    labelBn: { type: String, required: true },
    labelEn: { type: String, required: true },
    grams: { type: Number, required: true },
  },
  { _id: false }
);

const FoodPer100gSchema = new Schema<IFoodPer100g>(
  {
    kcal: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { _id: false }
);

const FoodSchema = new Schema<IFood>(
  {
    nameBn: { type: String, required: true, trim: true, index: true },
    nameEn: { type: String, required: true, trim: true, index: true },
    aliases: [{ type: String, trim: true }],
    category: {
      type: String,
      required: true,
      enum: [
        'grains',
        'lentils',
        'fish',
        'poultry_meat',
        'eggs_dairy',
        'vegetables_bhorta',
        'fruits',
        'snacks_beverages',
      ],
      index: true,
    },
    image: { type: String },
    per100g: { type: FoodPer100gSchema, required: true },
    servings: { type: [FoodServingSchema], default: [] },
    source: { type: String, required: true },
    verified: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound text index for fast bilingual search in MongoDB
FoodSchema.index({ nameBn: 'text', nameEn: 'text', aliases: 'text' });

export const FoodModel: Model<IFood> =
  mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema);
