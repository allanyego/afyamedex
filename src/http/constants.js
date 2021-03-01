export const PEER_HOST = "afyamedex-peer.herokuapp.com";

export const ROOT_URL =
  process.env.NODE_ENV === "production"
    ? "https://afyamedex.herokuapp.com"
    : "http://localhost:8080";

export const SERVER_URL = `${ROOT_URL}/api/v1`;

export const APPOINTMENT = {
  STATUSES: {
    UNAPPROVED: "UNAPPROVED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CLOSED: "CLOSED",
  },
  TYPES: {
    VIRTUAL_CONSULTATION: "VIRTUAL_CONSULTATION",
    ONSITE_CONSULTATION: "ONSITE_CONSULTATION",
    ONSITE_TESTS: "ONSITE_TESTS",
  },
};

export const APPOINTMENT_TYPE_LABELS = {
  [APPOINTMENT.TYPES.VIRTUAL_CONSULTATION]: "Virtual",
  [APPOINTMENT.TYPES.ONSITE_CONSULTATION]: "Onsite",
  [APPOINTMENT.TYPES.ONSITE_TESTS]: "Test",
};

export const USER = {
  ACCOUNT_TYPES: {
    PROFESSIONAL: "PROFESSIONAL",
    INSTITUTION: "INSTITUTION",
    PATIENT: "PATIENT",
    ADMIN: "ADMIN",
  },
};

export const SPECIALITIES = {
  Psychology: "Psychology",
  Psychiatry: "Psychiatry",
  Psychoanalysis: "Psychoanalysis",
  Psychotherapy: "Psychotherapy",
  "Mental Counselling": "Mental Counselling",
  "Family & Marriage": "Family & Marriage",
  "Addiction Counselling": "Addiction Counselling",
};

export const STORAGE_KEY = "afyamedex-storage";

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export const ALLOWED_VIDEO_FILE_TYPES = ["video/mp4", "video/webm"];

export const PROFILE_PICTURE_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
];

export const MAX_ATTACHMENT_SIZE = 5000000;

export const MAX_VIDEO_ATTACHMENT_SIZE = 100000000;

export const NAME_REGEX = /([a-zA-Z]+\s?\b){2,}/g;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;
export const REGEX = {
  FULL_NAME: /([a-zA-Z]+\s?\b){2,}/g,
  USERNAME: /^[a-zA-Z0-9]*$/,
};
