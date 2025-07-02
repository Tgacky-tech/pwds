// User and authentication types
export interface User {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
}

// Form data types
export interface DogFormData {
  purchaseSource: 'petshop' | 'breeder' | 'other' | '';
  hasPurchaseExperience: 'yes' | 'no' | '';
  breed?: string;
  fatherBreed?: string;
  motherBreed?: string;
  gender: 'male' | 'female' | '';
  birthDate: string;
  currentWeight: number | '';
  photos: File[];
  // Optional accuracy improvement fields
  birthWeight?: number | '';
  pastWeights?: Array<{ date: string; weight: number }>;
  motherAdultWeight?: number | '';
  fatherAdultWeight?: number | '';
}

// Weight evaluation categories
export type WeightCategory = 'underweight' | 'slightly_underweight' | 'ideal' | 'slightly_overweight' | 'overweight';

export interface WeightEvaluation {
  category: WeightCategory;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  description: string;
  advice: string;
  appropriateWeightRange: {
    min: number;
    max: number;
    center: number;
  };
}

// Cost simulation types
export interface CostSimulation {
  categories: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    items: Array<{
      name: string;
      cost: string;
    }>;
    total: string;
  }>;
}

// API response types
export interface PredictionResult {
  predictedWeight: number;
  predictedLength: number; // 体長（cm）
  predictedHeight: number; // 体高（cm）
  imageUrl: string;
  imagePrompt?: string; // 画像生成用プロンプト
  advice: {
    health: string;
    training: string;
    cost: string;
  };
  weightEvaluation: WeightEvaluation;
  costSimulation: CostSimulation;
}

// Dog breed data
export interface DogBreed {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large';
}

// Form validation errors
export interface FormErrors {
  [key: string]: string;
}