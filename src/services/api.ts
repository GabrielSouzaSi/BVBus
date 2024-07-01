import axios from "axios";
const url = "https://appbus.conexo.solutions/api/";
export const api = axios.create({
  baseURL: `${url}lines`,
});
export const lines = axios.create({
  baseURL: `${url}lines-mobile`,
});

export const lineBus = axios.create({
  // buscar dados da linha
  baseURL: `${url}lines`,
});

export const busDataLocation = axios.create({
  // buscar dados do onibus da linha
  baseURL: `${url}lines/busesLocationt`,
});

export const pointResult = axios.create({
  // buscar dados do tempo em relação ao ponto
  baseURL: `${url}line`,
});
