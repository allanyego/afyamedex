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
  },
  TYPES: {
    VIRTUAL_CONSULTATION: "VIRTUAL_CONSULTATION",
    ONSITE_CONSULTATION: "ONSITE_CONSULTATION",
    ONSITE_TESTS: "ONSITE_TESTS",
  },
};

export const USER = {
  ACCOUNT_TYPES: {
    PROFESSIONAL: "PROFESSIONAL",
    INSTITUTION: "INSTITUTION",
    PATIENT: "PATIENT",
  },
};

export const STORAGE_KEY = "afyamedex-storage";
