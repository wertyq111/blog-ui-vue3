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

export interface WeatherQuery {
  cityCode?: string;
}

const WeatherAPI = {
  getWeather(query?: WeatherQuery) {
    return request<any, WeatherData>({
      url: "/weather",
      method: "get",
      params: {
        city_code: query?.cityCode,
      },
      headers: { Authorization: "no-auth" },
    });
  },
};

export default WeatherAPI;
