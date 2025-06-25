
import {  useNavigate } from "react-router-dom";


function Banner() {
  const navigate=useNavigate();

  return (
    <div className="mt-15 py-20 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-blue-600 text-5xl font-extrabold mb-6 tracking-wide">
          HelpOnRoute
        </h1>

        <p className="text-gray-700 text-lg mb-10">
          Your safety, our mission. Tap below to request help or learn how the service works.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={()=>{
            navigate("/dashboard")
          }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition duration-300 ease-in-out">
            🚨 Request Help Now
          </button>

          <button onClick={()=>{
            navigate("/help-dashboard")
          }} className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 border border-blue-600 rounded-2xl shadow transition duration-300 ease-in-out">
            Help Others  Drivers
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
