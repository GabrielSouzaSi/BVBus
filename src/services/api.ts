import axios from "axios";

export const api = axios.create({
  baseURL: "http://appbus.conexo.solutions:8000/api/lines",
});

export const lineBus = axios.create({ // buscar dados da linha
  baseURL: "http://appbus.conexo.solutions:8000/api/lines",
});

export const busDataLocation = axios.create({ // buscar dados do onibus da linha
  baseURL: "http://appbus.conexo.solutions:8000/api/lines/busesLocationt",
});

export const pointResult = axios.create({ // buscar dados do tempo em relação ao ponto 
  baseURL: "http://appbus.conexo.solutions:8000/api/line",
});

export const bus = axios.create({
  baseURL: "http://appbus.conexo.solutions:8000/api",
});

