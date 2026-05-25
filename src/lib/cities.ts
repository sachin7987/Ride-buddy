export type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
};

export const POPULAR_CITIES: City[] = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lng: 88.2636 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.124 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Trivandrum", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
];

export function searchCities(query: string, limit = 8): City[] {
  if (!query.trim()) return POPULAR_CITIES.slice(0, limit);
  const q = query.toLowerCase();
  return POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
  ).slice(0, limit);
}
