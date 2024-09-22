import React, { useState, useEffect, useRef } from 'react';

// Define your API key as a variable
const API_KEY = ''; // Add your key

function Brawnify() {
  const [messages, setMessages] = useState([
    { user: 'Brawnie', content: 'Hey, welcome to Brawnify, how can I assist you?' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userMessage.trim()) return;

    const newMessage = { user: 'You', content: userMessage };
    setMessages([...messages, newMessage]);

    setLoading(true); // Show loading state

    // Call the API to get Brawnie's response
    const botResponse = await fetchGPTResponse(userMessage);
    setMessages((prevMessages) => [
      ...prevMessages,
      { user: 'Brawnie', content: botResponse },
    ]);

    setUserMessage('');
    setLoading(false); // Hide loading state
  };

  // Fetch GPT response
  const fetchGPTResponse = async (message) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`, // Using API key variable here
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
        }),
      });

      const responseBody = await response.json();
      console.log('Response Body:', responseBody);

      if (!response.ok) {
        console.error('API Error:', responseBody);
        throw new Error(`Error: ${responseBody.error.message}`);
      }

      return responseBody.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Message container with reduced height */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'} my-2`}
          >
            <div
              className={`${
                msg.user === 'You'
                  ? 'bg-gray-200 text-black'
                  : 'bg-green-100 text-green-800'
              } max-w-md w-full p-3 rounded-lg shadow-sm`}
            >
              <span className="block font-medium">{msg.content}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-green-100 text-green-800 max-w-md w-full p-3 rounded-lg shadow-sm">
              <span className="block font-medium">Loading...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */} 
      <form
        className="flex items-center p-4 border-t border-gray-300 bg-gray-50 mb-5"
        onSubmit={handleSendMessage}
      >
        <div className="flex-1">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none text-black bg-white"
          />
        </div>
        <button
          type="submit"
          className="ml-4 bg-green-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-700 focus:outline-none"
          disabled={loading} // Disable button while loading
        >
          <span className="material-symbols-outlined text-white">send</span>
        </button>
      </form>
    </div>
  );
}

export default Brawnify;
