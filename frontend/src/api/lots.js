export async function getLots() {
  try {
    const res = await fetch("http://localhost:4000/api/lots");
    return await res.json();
  } catch (error) {
    console.error("Error fetching lots:", error);
    return [];
  }
}
