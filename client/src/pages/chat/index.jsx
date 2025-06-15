import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as api from "../../api";

// Style components using Tailwind CSS
import "./App.css";
import ChatHistory from "./ChatHistory";
import Loading from "./Loading";
import { useLocales } from "src/hooks";
import { fDateTime } from "src/utils/formatTime";
import { fCurrency } from "src/utils/formatNumber";

const Chat = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);

  // Khởi tạo Gemini API
  const genAI = new GoogleGenerativeAI(
    "AIzaSyBs0trjta0pCC43STtXCxYiRcdVFA2I0Xk"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Thông tin về website
  const websiteInfo = `
    Tên website: HK Mobile - Cửa hàng điện thoại và phụ kiện chính hãng
    Mô tả: Đây là một tính năng giúp bạn có thể tiếp cận ứng dụng tốt hơn
    
    Thông tin cửa hàng:
    - Tên: HK Mobile
    - Loại hình: Cửa hàng điện thoại và phụ kiện chính hãng
    - Mạng xã hội: 
      + Facebook: https://www.facebook.com/mobileshop
      + Google: https://www.google.com/
      + LinkedIn: https://www.linkedin.com/
      + Twitter: https://www.twitter.com/

    Chính sách bán hàng:
    - 100% hàng chính hãng
    - Bảo hành chính hãng
    - Đổi trả trong 15 ngày nếu có lỗi
    - Giá đã bao gồm thuế

    Chức năng chính: 
    - Trò chuyện với người dùng và trả lời các câu hỏi
    - Tra cứu đơn hàng theo mã đơn hoặc số điện thoại
    - Tìm kiếm sản phẩm theo tên, danh mục
    - Xem chi tiết sản phẩm và đánh giá
    - Quản lý giỏ hàng và đơn hàng
    - Tài khoản người dùng với các tính năng:
      + Thông tin cá nhân
      + Sổ địa chỉ
      + Đổi mật khẩu

    Các đường dẫn quan trọng:
    - Để vào trang quản lý đơn hàng xin vui lòng click vào đây <a href="/order-history" target="_blank" rel="noopener noreferrer">Đơn hàng đã đặt</a>
    - Để vào giỏ hàng vui lòng click vào đây <a href="/cart" target="_blank" rel="noopener noreferrer">Giỏ hàng của bạn</a>
    - Để xem danh sách sản phẩm apple click vào đây: <a href="/q?b=apple" target="_blank" rel="noopener noreferrer">Xem danh sách sản phẩm apple</a>
    - Để vào trang chủ click vào đây: <a href="/" target="_blank" rel="noopener noreferrer">Trang chủ</a>
    - Để vào tài khoản click vào đây: <a href="/account" target="_blank" rel="noopener noreferrer">Tài khoản của bạn</a>
  `;

  // Hàm xử lý đầu vào của người dùng
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Hàm lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const params = {
        page: 1,
        limit: 1000000000
      };
      const accessToken = JSON.parse(sessionStorage.getItem('otpVerification'))?.accessToken;
      if (accessToken) {
        params.accessToken = accessToken;
      }
      const { data } = await api.getListOrders(params);
      setOrderList(data.data);
      return data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      return [];
    }
  };
  
  const { t, currentLang } = useLocales();

  useEffect(() => {
    fetchOrders();
  }, []);
  // Hàm gửi tin nhắn của người dùng đến Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      let response = "";

      // Kiểm tra nếu người dùng yêu cầu xem đơn hàng
      if (userInput.toLowerCase().includes("xem đơn hàng") ||
        userInput.toLowerCase().includes("đơn hàng đã đặt")) {
        if (orderList.length > 0) {
          response = `Đây là danh sách đơn hàng của bạn:\n\n${orderList.map(order =>
            `- Mã đơn: ${order._id}\n \n 
            - Trạng thái: ${t(`order.status-${order?.status}`)}\n  
            - Tổng tiền: ${fCurrency(order.total, currentLang.value)}\n
            - Ngày đặt: ${fDateTime(order?.createdAt, currentLang.value)}\n`
          ).join('\n')}\n\nBạn có thể click vào link "Đơn hàng đã đặt" ở trên để xem chi tiết.`;
        } else {
          response = "Bạn chưa có đơn hàng nào. Bạn có thể click vào link 'Đơn hàng đã đặt' ở trên để xem chi tiết.";
        }
      } else {
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
        {
          type: "bot",
          message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        },
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
      <h5>Chăm sóc khách hàng </h5>

      {chatHistory?.length > 0 && (
        <div className="chat-container">
          <ChatHistory chatHistory={chatHistory} />
          <Loading isLoading={isLoading} />
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder="Nhập tin nhắn của bạn..."
          value={userInput}
          onChange={handleUserInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              sendMessage();
            }
          }}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Gửi
        </button>
      </div>
      <button className="clear-button" onClick={clearChat}>
        Xóa chat
      </button>
    </div>
  );
};

export default Chat;
