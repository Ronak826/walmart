import  { useState } from 'react';

function HelpModal({ isOpen, onClose, onSend}:any) {
  const [issue, setIssue] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Request Help</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the type of problem you're experiencing. Your request will be sent directly to <strong>Drivers within 5 km range</strong>.
        </p>
        {issue}
        <select onChange={(e)=>{
          setIssue(e.target.value)
        }} className="w-full border p-2 rounded mb-4">
          <option>Select problem type</option>
          <option>Flat tire</option>
          <option>Engine issue</option>
          <option>Medical Emergency</option>
        </select>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700">
            Cancel
          </button>
          <button
           onClick={() => onSend(issue)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Send 
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
