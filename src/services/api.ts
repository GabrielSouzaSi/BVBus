import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.100.73:3000",
});

export const restDB = axios.create({
  baseURL: "https://mapdata-8cfb.restdb.io/rest",
  headers: {
    "Content-Type": "application/json",
    "x-apikey": "024b333c554a1f3df9c9c6bc159fd3416efdc",
    "cache-control": "no-cache",
  },
});

