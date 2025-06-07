import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Style components using Tailwind CSS
import "./App.css";
import ChatHistory from "./ChatHistory";
import Loading from "./Loading";

const Chat = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo Gemini API
  const genAI = new GoogleGenerativeAI(
    "AIzaSyBs0trjta0pCC43STtXCxYiRcdVFA2I0Xk"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Thông tin về website
  const websiteInfo = `
    Tên website: Bán hàng điện tử
    Mô tả: Đây là một tính năng giúp bạn có thể tiếp cận ứng dụng tốt hơn
    Chức năng chính: 
    - Trò chuyện với người dùng và trả lời các câu hỏi
    - Tra cứu đơn hàng theo mã đơn hoặc số điện thoại
    - Tìm kiếm sản phẩm theo tên, danh mục
    Công nghệ sử dụng: React, Gemini API
  `;

  // Hàm xử lý đầu vào của người dùng
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Hàm tra cứu đơn hàng
  const searchOrder = async (searchText) => {
    try {
      const response = await fetch(`/api/orders?search=${searchText}`);
      const data = await response.json();
      if (data.success) {
        return `Thông tin đơn hàng:\n${data.data.map(order => `
          Mã đơn: ${order.numericId}
          Trạng thái: ${order.status}
          Tổng tiền: ${order.total.toLocaleString('vi-VN')}đ
          Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}
        `).join('\n')}`;
      }
      return "Không tìm thấy đơn hàng nào";
    } catch (error) {
      return "Có lỗi xảy ra khi tra cứu đơn hàng";
    }
  };

  // Hàm tìm kiếm sản phẩm
  const searchProduct = async (searchText) => {
    try {
      const response = await fetch(`/api/products?search=${searchText}`);
      const data = await response.json();
      if (data.success) {
        return `Kết quả tìm kiếm sản phẩm:\n${data.data.map(product => `
          Tên: ${product.name}
          Giá: ${product.price.toLocaleString('vi-VN')}đ
          Danh mục: ${product.category?.name || 'Chưa phân loại'}
        `).join('\n')}`;
      }
      return "Không tìm thấy sản phẩm nào";
    } catch (error) {
      return "Có lỗi xảy ra khi tìm kiếm sản phẩm";
    }
  };

  // Hàm gửi tin nhắn của người dùng đến Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      let response = "";
      
      // Kiểm tra nếu là câu hỏi về đơn hàng
      if (userInput.toLowerCase().includes("đơn hàng") || userInput.toLowerCase().includes("tra cứu")) {
        response = await searchOrder(userInput);
      }
      // Kiểm tra nếu là câu hỏi về sản phẩm
      else if (userInput.toLowerCase().includes("sản phẩm") || userInput.toLowerCase().includes("tìm kiếm")) {
        response = await searchProduct(userInput);
      }
      // Nếu không phải các trường hợp trên, gửi đến Gemini
      else {
        const prompt = `${websiteInfo}\n\nCâu hỏi của người dùng: ${userInput}`;
        const result = await model.generateContent(prompt);
        const geminiResponse = await result.response;
        response = geminiResponse.text();
      }
      
      // Thêm phản hồi vào lịch sử trò chuyện
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response },
      ]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau." },
      ]);
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Hàm xóa lịch sử trò chuyện
  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="container">
      <h1>Chatbot</h1>

      <div className="chat-container">
        <ChatHistory chatHistory={chatHistory} />
        <Loading isLoading={isLoading} />
      </div>

      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder="Nhập tin nhắn của bạn..."
          value={userInput}
          onChange={handleUserInput}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Gửi
        </button>
      </div>
      <button
        className="clear-button"
        onClick={clearChat}
      >
       Xóa chat
      </button>
    </div>
  );
};

export default Chat;
