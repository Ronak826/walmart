import { useState } from 'react';

function HelpModal({ isOpen, onClose, onSend }: any) {
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('');
  const [isSending, setIsSending] = useState(false); // New state for loading indicator

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!issue || issue === 'Select problem type') {
      alert('Please select a problem type before sending.');
      return;
    }
    if (!urgency) {
      alert('Please select the urgency level.');
      return;
    }

    setIsSending(true); // Start loading
    
    try {
      // Pass all data
      await onSend({issue, description, urgency});
      
      // Reset fields only if send is successful
      setIssue('');
      setDescription('');
      setUrgency('');
    } catch (error) {
      console.error("Error sending help request:", error);
      // Optionally show error message to user
    } finally {
      setIsSending(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative" style={{ zIndex: 10000 }}>
        <h2 className="text-xl font-semibold mb-2">🚨 Request Help</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the type of problem you're experiencing. Your request will be sent directly to <strong>Drivers within 6 km range</strong>.
        </p>

        {/* Issue type */}
        <select
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={isSending} // Disable while sending
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

        {/* Urgency level */}
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSending} // Disable while sending
        >
          <option value="">Select urgency level</option>
          <option value="Low">🟢 Low</option>
          <option value="Medium">🟡 Medium</option>
          <option value="High">🔴 High</option>
        </select>

        {/* Optional description */}
        <textarea
          placeholder="Optional: Describe your issue in more detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={3}
          disabled={isSending} // Disable while sending
        />

        {issue && urgency && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
            <p><strong>Issue:</strong> {issue}</p>
            <p><strong>Urgency:</strong> {urgency}</p>
            {description && <p><strong>Description:</strong> {description}</p>}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              onClose();
              setIssue('');
              setDescription('');
              setUrgency('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={isSending} // Disable while sending
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center justify-center min-w-32"
            disabled={isSending} // Disable while sending
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>📤 Send Help Request</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;