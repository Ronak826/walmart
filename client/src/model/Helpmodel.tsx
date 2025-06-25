import { useState } from 'react';

function HelpModal({ isOpen, onClose, onSend }: any) {
  const [issue, setIssue] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!issue || issue === 'Select problem type') {
      alert('Please select a problem type before sending.');
      return;
    }
    onSend(issue);
    setIssue(''); // Reset the issue after sending
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative" style={{ zIndex: 10000 }}>
        <h2 className="text-xl font-semibold mb-2">🚨 Request Help</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the type of problem you're experiencing. Your request will be sent directly to <strong>Drivers within 6 km range</strong>.
        </p>
        
        <select 
          value={issue}
          onChange={(e) => {
            setIssue(e.target.value);
          }} 
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select problem type</option>
          <option value="Flat tire">🛞 Flat tire</option>
          <option value="Engine issue">⚙️ Engine issue</option>
          <option value="Medical Emergency">🚑 Medical Emergency</option>
          <option value="Fuel shortage">⛽ Fuel shortage</option>
          <option value="Battery dead">🔋 Battery dead</option>
          <option value="Accident">💥 Accident</option>
          <option value="Other">❓ Other</option>
        </select>

        {issue && issue !== 'Select problem type' && (
          <div className="mb-4 p-2 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected issue:</strong> {issue}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => {
              onClose();
              setIssue(''); // Reset issue when closing
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            📤 Send Help Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;