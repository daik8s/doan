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
    Tên website: Cửa hàng điện thoại và phụ kiện chính hãng
    Mô tả: Đây là một tính năng giúp bạn có thể tiếp cận ứng dụng tốt hơn
    
    Thông tin cửa hàng:
    - Tên: Đại Nguyễn Mobile
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

  const handleSearchProduct = async (keyword) => {
    const { data } = await api.getSearchSuggest(keyword);
    return data.data;
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
          response = `<div class="order-list">
            <h3>Đây là danh sách đơn hàng của bạn:</h3>
            ${orderList.map(order => `
              <div class="order-item">
                <p><strong>Mã đơn:</strong> ${order._id}</p>
                <p><strong>Trạng thái:</strong> ${t(`order.status-${order?.status}`)}</p>
                <p><strong>Tổng tiền:</strong> ${fCurrency(order.total, currentLang.value)}</p>
                <p><strong>Ngày đặt:</strong> ${fDateTime(order?.createdAt, currentLang.value)}</p>
                <hr />
              </div>
            `).join('')}
            <p>Bạn có thể click vào link "Đơn hàng đã đặt" ở trên để xem chi tiết.</p>
          </div>`;
        } else {
          response = `<div class="no-orders">
            <p>Bạn chưa có đơn hàng nào. Bạn có thể click vào link 'Đơn hàng đã đặt' ở trên để xem chi tiết.</p>
          </div>`;
        }
      } else if (userInput.toLowerCase().includes("tìm kiếm") || userInput.toLowerCase().includes("tìm")) {
        const searchKeyword = userInput.replace(/tìm kiếm|tìm/gi, '').trim();
        if (searchKeyword) {
          const data = await handleSearchProduct(searchKeyword);

          if (data && data?.length > 0) {
            response = `<div class="search-results">
              <h3>Kết quả tìm kiếm cho "${searchKeyword}":</h3>
              ${data?.map(product => `
                <div class="product-item">
                  <h4>${product.name}</h4>
                  <p><strong>Giá:</strong> ${fCurrency(product.variants[0].price, currentLang.value)}</p>
                  <a href="/product/${product.slug}" class="view-details" target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
                </div>
              `).join('')}
            </div>`;
          } else {
            response = `<div class="no-results">
              <p>Không tìm thấy sản phẩm nào phù hợp với "${searchKeyword}". Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>`;
          }
        } else {
          response = `<div class="search-prompt">
            <p>Vui lòng nhập từ khóa tìm kiếm.</p>
          </div>`;
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
          message: `<div class="error-message">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.</div>`
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
