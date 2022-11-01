import { useEffect, useState } from 'react';
import WeatherBox from './component/WeatherBox';
import WeatherButton from './component/WeatherButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import ClipLoader from 'react-spinners/ClipLoader';
import './App.css';

//1. 앱이 실행 되자 마자 현재 위치 기반의 날씨가 보인다
//2. 지금 현재 도시와 섭씨/화씨 , 날씨 상태 정보가 나온다
//3. 하단에 도시 버튼 5개 (현재위치, 다른 도시 4개)
//4. 버튼을 누를 때 마다 해당 되는 도시별 날씨가 보여진다
//5. 현재위치 버튼을 누르면 다시 현재위치 기반의 날씨 정보를 보여준다
//6. 데이터를 들고오는 동안 로딩 스피너가 돌아간다
function App() {
    const [weather, setWeather] = useState('');
    const [error, setError] = useState('');
    const [city, setCity] = useState('');
    const [id, setId] = useState('');
    const [icon, setIcon] = useState('');
    const [loading, setLoading] = useState(false); //기본값은 false, 데이터 fetch일 때만 true로 바꿔주어 스피너 보여준다
    const cities = ['seoul', 'busan', 'jeju', 'new york', 'tokyo'];
    const [query, setQuery] = useState('');
    const API_KEY = "81523c3aa0ea13bf7e0d71967cd5d5d4";
    
    /* 현재 위치의 위도 경도 가져오기 */
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            console.log('현재 위도 경도는?', lat, lon);
            getWeatherByCurrentLocation(lat, lon);
        });
    };
    /* 현재 위치의 날씨 정보 */
    const getWeatherByCurrentLocation = async (lat, lon) => {
      let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      let response = await fetch(url);
      let data = await response.json();
      console.log('데이터 확인!', data);
      setWeather(data);
      setId(data.weather[0].id);
      setIcon(data.weather[0].icon);
      setLoading(false); //스피너 종료
    };
    /* 검색 기능 */
    const search = async (e) => {
      try{
          if(e.key === "Enter"){
              fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`)
              .then(res => res.json())
              .then(result => {
                  setWeather(result);
                  setQuery('');
                  console.log("result 확인", result);
              })
          }
      }catch(error){
          console.log('잡힌 에러는?', error.message);
          errorRender(error.message);
          //서치 잘못 했을 때 화면 안날아가고 에러메세지만 띄우게 하기
      }
    }
    const errorRender = (message) => {
      setError(message);
    }
    
  /* 도시별 날씨 가져오기 */
  const getWeatherByCity = async () => {
    try {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        let response = await fetch(url);
        let data = await response.json();
        setWeather(data);
        setId(data&&data.weather[0].id);
        setIcon(data&&data.weather[0].icon);
    } catch (error) {
        console.log('잡힌 에러는?', error.message);
        setError(error.message);
        setLoading(true);
    }
    setLoading(false);
};
useEffect(() => {
  setLoading(true);
  getCurrentLocation();
}, []);

useEffect((city)=>{
    setLoading(true);
    getWeatherByCity();
},[city]);

    /* 도시 선택하기 */
    const handleCityChange = (city) => {
      if (city === 'current') {
          setCity('');
      } else {
          setCity(city);
      }
  };
    return (
      /* UI를 보여주는 곳 */
      <div>
      {loading ? (
          <div className="container">
              <ClipLoader color="#ff0000" loading={loading} size={100} />
          </div>
      ) : (
          <div className={(typeof weather.main != "undefined")
          ? ((weather&&weather.main.temp > 23)
              ? 'container_warm' : 'container') : 'container'}>
              <div className='search_box'>
                  <input
                  type="text"
                  placeholder='enter city name'
                  onChange={e=>setQuery(e.target.value)}
                  value={query}
                  onKeyPress={search}
                  >
                  </input>
              </div>
              <WeatherBox weather={weather} id={id} icon={icon}/> {/* props로 넘기기 */}
              <WeatherButton cities={cities} selectCity={city} handleCityChange={handleCityChange} /> {/* setCity라는 함수를 props로 넘겨준다 */}
          </div>
        )}
      </div>
    )
}

export default App;