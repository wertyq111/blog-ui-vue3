import request from "@/utils/request";

export interface WeatherData {
  province: string;
  city: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
}

const WeatherAPI = {
  getWeather() {
    return request<any, WeatherData>({
      url: "/weather",
      method: "get",
      headers: { Authorization: "no-auth" },
    });
  },
};

export default WeatherAPI;
