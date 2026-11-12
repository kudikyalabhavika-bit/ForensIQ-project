// Central API service for all Flask backend communication.
// All fetch calls live here so components never hardcode URLs.

const API_BASE_URL = "http://127.0.0.1:5000";

// Fetch the list of PNG filenames for a given facial feature category.
// Example: getFeatures("hair") -> ["hair1.png", "hair2.png", ...]
export async function getFeatures(type) {
  const response = await fetch(`${API_BASE_URL}/features/${type}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch features for ${type}`);
  }
  return response.json();
}

// Send the full canvas state to Flask so Pillow can composite the final sketch.
export async function generateSketch(data) {
  const response = await fetch(`${API_BASE_URL}/generate-sketch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to generate sketch");
  }
  return response.json();
}

// Build the full URL for a feature asset image.
export function getFeatureImageUrl(type, filename) {
  return `${API_BASE_URL}/assets/${type}/${filename}`;
}

export { API_BASE_URL };
