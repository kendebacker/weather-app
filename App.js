import React, { useState, useEffect } from 'react'
import { StyleSheet,TextInput,FlatList,TouchableOpacity, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { API_KEY } from './Secrets'

// Component for displaying a city's name, temperature, and weather conditions
const WeatherRow = ({city, temperature, icon}) => {
  
    return (
      <View style={styles.listRow}>
        <Text style={styles.listCity}>{city}</Text>
        <Text style={styles.listTemp}>{temperature}</Text>
        <MaterialCommunityIcons style={styles.icon} name={icon} size={24}/>
      </View>
    )
  }

export default function KensApp(){
  
  // List of cities
  const [cityList, setCityList] = useState(["San Francisco", "San Diego","Oakland","Los Angeles","Freemont"])
  // Weather information for each city
  const [weather, setWeather] = useState([])
  // Value of city input
  const [currentCity, setCurrentCity] = useState("")
  // Time of last refresh (via refresh button or adding of new city)
  const [time, setTime] = useState("")

  // Load default cities on app launch
  useEffect(()=>{
    refreshCities(false)
  },[])

  // Function to reload all cities user has displayed, "add" is true/false, indicates whether the input should be added as an additional city or not
  const refreshCities = (add) => {
    // Fetch city information from API
    const cities = add ? [...cityList, currentCity] : cityList
    const icons = {Clear: "white-balance-sunny" , Clouds: "weather-cloudy" , Rain: "weather-rainy"}
    Promise.all(cities.map((item) => fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${item.city},${item.state},${item.country}&limit=10&appid=${API_KEY}`)))
    .then((responseList) => Promise.all(responseList.map((res) => res.json().then((jsonCity) => jsonCity.length === 0 ? Promise.resolve(null) : fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${jsonCity[0].lat}&lon=${jsonCity[0].lon}&appid=${API_KEY}`)))))
    .then((responseList) => Promise.all(responseList.map((res) => res !== null ? res.json() : Promise.resolve(null))))
    .then((jsonList) => jsonList.map((json, index) => {return  {city: cities[index].city, 
      temperature: json === null ? "??°F" : `${Math.round((json.main.temp -273)*1.8 + 32,2)}°F`, 
      icon: json === null ? "cloud-question" : icons[json.weather[0].main] === undefined ? "cloud-question" : icons[json.weather[0].main]}}))
    .then((weatherList) => setWeather(weatherList))
    // Update time of last refresh information
    const currentDate = new Date()
    const amPM = currentDate.getHours() >= 12 ? "PM" : "AM"
    const hours = currentDate.getHours() > 12 ? currentDate.getHours()-12 : currentDate.getHours()
    const minutes = currentDate.getMinutes() < 10 ? `0${currentDate.getMinutes()}` : currentDate.getMinutes()
    const seconds = currentDate.getSeconds() < 10 ? `0${currentDate.getSeconds()}` : currentDate.getSeconds()
    setTime(`${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()} ${hours}:${minutes}:${seconds} ${amPM}`)
    setCityList(cities)
    setCurrentCity(add ? "" : currentCity)
  }

  return(
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Ken's Weather App</Text>
      </View>
      <View style={styles.inputRow}>
        <TextInput
        style={styles.inputFeild}
        value ={currentCity}
        onChangeText={(text)=>setCurrentCity(text)}
        />
        <TouchableOpacity
        style={styles.inputButton}
        onPress={()=>{refreshCities(true)}}
        >
          <MaterialCommunityIcons name="plus-circle" size={40} color="#00274C" />
        </TouchableOpacity>
      </View>
      <View style={styles.weatherList}> 
      <FlatList
        style = {styles.weatherFlatlist}
        data={weather}
        renderItem={({item}) => {
          return (
            <WeatherRow
            city = {item.city}
            temperature = {item.temperature}
            icon = {item.icon}
            />
          )}}
      />
      </View>
      <View style={styles.refreshRow}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={()=>{refreshCities(false)}}
          >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        <Text style={styles.refreshInfo}>Last Updated: {time}</Text>
      </View>
    </View>
      )
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff'
  },
  titleRow: {
    flex: .15,
    flexDirection: "row",
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#00274C'
  },
  titleText: {
    flex: 1,
    textAlign: "center",
    fontSize: 30,
    padding: 20,
    color: "#FFCB05"
  },
  inputRow: {
    flex: .1,
    flexDirection: "row",
    alignItems: 'center',
  },
  inputFeild: {
    flex: .5,
    borderWidth: 2,
    fontSize: 24,
    height: "70%",
    padding: 5,
    borderRadius: "5px",
    borderColor: "#00274C",
    color: "#00274C"
  },
  inputButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    height: "70%",
    aspectRatio: "1/1",
    borderRadius: "5px",
    borderWidth: 2,
    backgroundColor:'#FFCB05',
    borderColor: "#00274C"
  },
  weatherList:{
    flex:.5,
    width: "100%",
    paddingLeft: 10
  },
  weatherFlatlist:{
    padding: 10,
  },
  refreshRow:{
    flex: .2,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  refreshButton: {
    flex: .35,
    borderRadius: "5px",
    borderWidth: 2,
    padding: 15,
    paddingTop: 11,
    backgroundColor:'#FFCB05',
    borderColor: "#00274C"
  },
  refreshText:{
    flex: 1,
    fontSize: 25,
    paddingBottom: 5,
    color: "#00274C"
  },
  refreshInfo:{
    flex:.15,
    padding: 10,
    color: "#00274C"
  },
  icon:{
    flex: 1,
    textAlign:"center",
    paddingTop: 5,
    color: "#00274C"
  },
  listCity:{
    flex:1,
    textAlign:"center",
    padding: 10,
    color: "#00274C"
  },
  listTemp:{
    flex:1,
    textAlign: "center",
    padding: 10,
    color: "#00274C"
  },
  listRow:{
    flex: .1,
    flexDirection:"row",
    padding: 5,
  },
  textInput:{
    color: "#00274C"
  }
})
