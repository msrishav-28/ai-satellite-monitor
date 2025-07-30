import { NextResponse } from 'next/server'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const WAQI_API_KEY = process.env.WAQI_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_KEY}`)
    ])

    if (!weatherRes.ok) {
      throw new Error('Failed to fetch weather data')
    }
    if (!aqiRes.ok) {
      throw new Error('Failed to fetch AQI data')
    }

    const weatherData = await weatherRes.json()
    const aqiData = await aqiRes.json()

    const formattedWeather = {
      temperature: weatherData.main.temp,
      apparentTemperature: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.deg,
      description: weatherData.weather[0].description,
    }

    const formattedAqi = {
      value: aqiData.data.aqi,
      pollutants: Object.entries(aqiData.data.iaqi).map(([key, value]: [string, any]) => ({
        name: key.toUpperCase(),
        value: value.v,
      })),
    }

    return NextResponse.json({
      weather: formattedWeather,
      aqi: formattedAqi,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch environmental data' }, { status: 500 })
  }
} 