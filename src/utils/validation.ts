import { DogFormData, FormErrors } from '../types';

export const validateForm = (formData: DogFormData, showAccuracySection: boolean = false): FormErrors => {
  const errors: FormErrors = {};

  // Required fields validation
  if (!formData.purchaseSource) {
    errors.purchaseSource = '購入元を選択してください';
  }

  if (!formData.hasPurchaseExperience) {
    errors.hasPurchaseExperience = '購入経験の有無を選択してください';
  }

  if (!formData.breed) {
    errors.breed = '犬種を選択してください';
  }

  if (!formData.gender) {
    errors.gender = '性別を選択してください';
  }

  if (!formData.birthDate) {
    errors.birthDate = '生年月日を入力してください';
  } else {
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.birthDate = '未来の日付は選択できません';
    }
  }

  if (!formData.currentWeight || formData.currentWeight <= 0) {
    errors.currentWeight = '現在の体重を入力してください';
  }

  if (formData.photos.length === 0) {
    errors.photos = '写真を最低1枚アップロードしてください';
  }

  // Additional validation when accuracy section is open
  if (showAccuracySection) {
    if (!formData.pastWeights || formData.pastWeights.length === 0) {
      errors.pastWeights = '過去の体重記録を最低1件入力してください';
    } else {
      // Validate each past weight record
      formData.pastWeights.forEach((record, index) => {
        if (!record.date) {
          errors[`pastWeight_${index}_date`] = `${index + 1}件目の日付を入力してください`;
        }
        if (!record.weight || record.weight <= 0) {
          errors[`pastWeight_${index}_weight`] = `${index + 1}件目の体重を入力してください`;
        }
      });
    }

    if (!formData.motherAdultWeight || formData.motherAdultWeight <= 0) {
      errors.motherAdultWeight = '母親の成犬時体重を入力してください';
    }

    if (!formData.fatherAdultWeight || formData.fatherAdultWeight <= 0) {
      errors.fatherAdultWeight = '父親の成犬時体重を入力してください';
    }
  }

  return errors;
};

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};