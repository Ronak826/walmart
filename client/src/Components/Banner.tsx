import { Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Banner() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-16">
      <div className="text-center max-w-2xl">

        {/* Icon in blue circle */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <Car className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-2">
          HelpOnRoute
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
          Driver Support Platform
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-base sm:text-lg mb-2">
          Helping each other on the road to ensure on-time deliveries.
        </p>
        <p className="text-gray-600 text-base sm:text-lg mb-8">
          Connect with nearby Walmart delivery partners for instant roadside assistance.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Request Help Now
          </button>

          <button
            onClick={() => navigate('/help-dashboard')}
            className="border border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition"
          >
            Help Other Drivers
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
