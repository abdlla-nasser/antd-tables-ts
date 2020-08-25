export const BASE_URL = `http://clinio-api-stg.tapps.studio/`;

export const getRequest = async (url: string, headers = {}) => {
  return await fetch(BASE_URL + url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjIwNjk5MTZmZGFhZjE2ODA0ZTdiYzMiLCJpYXQiOjE1OTcyMjQ4MDd9.K9q4-35exM2PVemokdRVcQ-cRUu_PODZB6_MYd657_M",
      "Content-Type": "application/json",
      ...headers,
    },
  });
};
