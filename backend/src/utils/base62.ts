const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encodeBase62(num: number): string {
  let res = '';
  while (num > 0) {
    res = chars[num % 62] + res;
    num = Math.floor(num / 62);
  }
  return res.padStart(5, '0'); // Ensures minimum length of 5
}

export function generateRandomCode(length: number = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateShortCode(objectId: string, salt?: number): string {
  // Convert ObjectId to a number (using first 8 characters for simplicity)
  const objectIdNum = parseInt(objectId.substring(0, 8), 16);
  
  // Add salt if provided
  const finalNum = salt ? objectIdNum + salt : objectIdNum;
  
  // Encode to base62
  return encodeBase62(finalNum);
} 