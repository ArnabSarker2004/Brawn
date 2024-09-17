import React, { useState } from 'react';

// Define your API key as a variable
const API_KEY = ''; //Add Key

function ChatComponent() {
  const [messages, setMessages] = useState([
    { user: 'Brawnie', content: 'Hey, welcome to Brawnify, how can I assist you?' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
          model: 'gpt-3.5-turbo', // Use gpt-3.5-turbo if quota allows
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
    <div className="flex flex-col w-full h-screen bg-gray-100 border border-gray-300 rounded-lg shadow-lg">
      <div className="bg-green-100 py-4 text-center border-b border-gray-300">
        <h1 className="text-2xl font-semibold text-green-700">Brawnify Chat</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                msg.user === 'You'
                  ? 'bg-white text-right'
                  : 'bg-green-100 text-left border-green-500'
              } max-w-xs md:max-w-md p-4 rounded-lg border`}
            >
              <span className="block font-semibold">{msg.user}:</span>
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-green-100 text-left border-green-500 max-w-xs md:max-w-md p-4 rounded-lg border">
              <span className="block font-semibold">Brawnify Bot:</span>
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>

      <form
        className="flex items-center p-4 border-t border-gray-300 bg-white"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
        />
        <button
          type="submit"
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
          disabled={loading} // Disable button while loading
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;
