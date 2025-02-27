// frontend/src/components/Chatbot.jsx
import { useState } from "react";
import Groq from "groq-sdk";
import styles from "../style";

const Chatbot = ({ selectedFund }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const groqClient = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const prompt = selectedFund
      ? `The user is asking about the mutual fund "${selectedFund.name}" (Code: ${selectedFund.code}). Here's their question or suggestion: "${input}". Provide a helpful, conversational response as if you're a friendly financial advisor. Keep it simple and avoid overly technical terms.`
      : `The user asked: "${input}". Since no mutual fund is selected, provide a general helpful response about mutual funds or prompt them to select a fund for specific advice.`;

    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null,
      });

      let botResponse = "";
      for await (const chunk of chatCompletion) {
        botResponse += chunk.choices[0]?.delta?.content || "";
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === "assistant") {
            updatedMessages[updatedMessages.length - 1] = { role: "assistant", content: botResponse };
          } else {
            updatedMessages.push({ role: "assistant", content: botResponse });
          }
          return updatedMessages;
        });
      }
    } catch (err) {
      console.error("Error fetching chatbot response:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong. Try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chatbot Icon */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="w-12 h-12 bg-blue-gradient rounded-full flex items-center justify-center text-white shadow-lg hover:bg-secondary transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="bg-gray-800 rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center p-3 bg-black-gradient rounded-t-lg">
            <h3 className="text-white text-lg font-semibold">Fund Chatbot</h3>
            <button
              onClick={handleToggleChat}
              className="text-dimWhite hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-900 text-white">
            {messages.length === 0 ? (
              <p className="text-dimWhite text-sm">
                Ask me anything about{" "}
                {selectedFund ? `${selectedFund.name}!` : "mutual funds!"}
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      msg.role === "user" ? "bg-blue-gradient text-primary" : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))
            )}
            {loading && (
              <div className="text-left">
                <span className="inline-block p-2 rounded-lg bg-gray-700 text-white">
                  Typing...
                </span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 rounded bg-gray-900 text-white focus:outline-none border border-gray-700 resize-none"
              placeholder="Type your question..."
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className={`mt-2 w-full py-2 rounded bg-blue-gradient text-primary font-poppins font-medium ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;