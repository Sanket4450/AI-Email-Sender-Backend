export const ERROR_MSG = {
  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',

  // Auth
  UNAUTHORIZED: 'Unauthorized!',
  JSON_WEB_TOKEN_ERROR: 'JsonWebTokenError',
  TOKEN_EXPIRED_ERROR: 'TokenExpiredError',
  TOKEN_EXPIRED: 'Token has expired!',

  // Company
  COMPANY_NOT_FOUND: 'Company not found',
  COMPANY_ALREADY_EXISTS: 'Company already exists with this title',

  // Contact
  CONTACT_NOT_FOUND: 'Contact not found',
  CONTACT_ALREADY_EXISTS: 'Contact already exists with this email',

  // Tag
  TAG_NOT_FOUND: 'Tag not found',
  ONE_OR_MORE_TAGS_NOT_FOUND: 'One or more tags not found',
  TAG_ALREADY_EXISTS: 'Tag already exists with this title',
};

export const VALIDATION_MSG = {
  // Contact
  PHONE: 'Phone number must be 10 characters long',
};

export const SUCCESS_MSG = {
  // General
  OK: 'OK!',

  // Auth
  USER_REGISTERED: 'User registered successfully',
  LOGGED_IN: 'User Logged in successfully',
  LOGGED_OUT: 'User Logged out successfully',

  // Company
  COMPANY_CREATED: 'Company created successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  COMPANY_DELETED: 'Company deleted successfully',
  COMPANIES_FETCHED: 'Companies fetched successfully',
  COMPANY_FETCHED: 'Company fetched successfully',

  // Company
  CONTACT_CREATED: 'Contact created successfully',
  CONTACT_UPDATED: 'Contact updated successfully',
  CONTACT_DELETED: 'Contact deleted successfully',
  CONTACTS_FETCHED: 'Contacts fetched successfully',
  CONTACT_FETCHED: 'Contact fetched successfully',

  // Tag
  TAG_CREATED: 'Tag created successfully',
  TAG_UPDATED: 'Tag updated successfully',
  TAG_DELETED: 'Tag deleted successfully',
  TAGS_FETCHED: 'Tags fetched successfully',
  TAG_FETCHED: 'Tag fetched successfully',

  // User
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
};
