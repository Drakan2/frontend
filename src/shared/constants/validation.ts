export const VALIDATION_REGEX = {
  PHONE: /^[0-9]{8}$/,
  CIN: /^[0-9]{8}$/,
};

export const VALIDATION_LIMITS = {
  CIN_MAX_LENGTH: 8,
  CIN_MNI_LENGTH: 8,
  PHONE_MAX_LENGTH: 8,
  PHONE_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
};

export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_CIN: 'Format CIN invalide',
};