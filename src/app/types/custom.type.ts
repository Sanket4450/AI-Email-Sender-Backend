// Define a branded type for CUID
export type CUID = string & { readonly __brand: unique symbol };

// Utility function to validate and cast a string to a CUID
export function isCUID(value: string): value is CUID {
  // CUID validation regex (25 characters, alphanumeric, starting with 'c')
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(value);
}

// Function to safely create a CUID
export function toCUID(value: string): CUID {
  if (!isCUID(value)) {
    throw new Error(`Invalid CUID: ${value}`);
  }
  return value as CUID;
}
