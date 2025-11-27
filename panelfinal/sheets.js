const API_URL = "https://script.google.com/macros/s/AKfycbxypuZYU4cctCcLuuFvKe6IjaT2xN4VoXwp2DdzSGA4fxnoWQozpOgGy9EfFTeGJYPc-w/exec";

async function apiRequest(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  return res.json();
}
