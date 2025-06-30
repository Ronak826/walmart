
import Navbar from '../Components/Navbar';

function Completed() {
  return (
    <>
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center space-y-6">
          {/* Header with icon */}
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800">Help Completed</h1>
          
          {/* Content with better spacing */}
          <div className="space-y-4 text-gray-600">
            <p>
              Thank you for stepping up and helping a fellow delivery partner.
              Your support keeps Walmart's delivery network strong and reliable.
            </p>
            
            <p>
              Your contribution is making a positive difference in the community.
              Once your help is verified by an admin, you'll receive your well-deserved reward and recognition!
            </p>
          </div>
          
          {/* Signature line */}
          <p className="text-blue-600 font-medium pt-4 border-t border-gray-100">
            Together, we deliver better. <span className="ml-1">🚚💙</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Completed;