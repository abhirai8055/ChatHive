// Dashboard.js

import { useEffect, useRef, useState } from "react";
import Img1 from "../../asset/profile-user-svgrepo-com.svg"; // Default avatar
import Input from "../../components/input/index"; // Custom Input component
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate for redirection

  // State to store the current user's details
  const [user, setUser] = useState(() => {
    const userDetail = localStorage.getItem("user:detail");
    return userDetail ? JSON.parse(userDetail) : null;
  });

  // State to store all conversations of the current user
  const [conversations, setConversations] = useState([]);

  // State to store messages, the selected receiver, and the current conversation ID
  const [messages, setMessages] = useState({
    messages: [],
    receiver: null,
    conversationId: null,
  });

  // State to store the current message being typed
  const [message, setMessage] = useState("");

  // State to store all users (people) excluding the current user
  const [users, setUsers] = useState([]);

  // State to store the Socket.io client instance
  const [socket, setSocket] = useState(null);

  // Reference to the latest message element for auto-scrolling
  const messageRef = useRef(null);

  // State to manage edit modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // States for editing user info
  const [editedFullName, setEditedFullName] = useState(user?.fullName || "");
  const [editedImage, setEditedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image || Img1);

  /**
   * Initialize Socket.io connection on component mount
   */
  useEffect(() => {
    console.log("Initializing Socket.io connection...");
    // Connect to the Socket.io server on port 9000
    const newSocket = io("http://localhost:9000");
    setSocket(newSocket);

    // Clean up the Socket.io connection when the component unmounts
    return () => {
      console.log("Closing Socket.io connection...");
      newSocket.close();
    };
  }, []);

  /**
   * Handle Socket.io events once the socket and user are available
   */
  useEffect(() => {
    if (socket && user?.id) {
      console.log(`Adding user to Socket.io with ID: ${user.id}`);
      // Emit 'addUser' event to register the current user with Socket.io
      socket.emit("addUser", user.id);

      // Listen for active users from the server
      socket.on("getUsers", (activeUsers) => {
        console.log("Active Users:", activeUsers);
        // Optional: Update UI with active users if needed
      });

      // Listen for incoming messages
      socket.on("getMessage", (data) => {
        console.log("Received message via Socket.io:", data);

        // Check if the incoming message belongs to the current conversation
        if (data.conversationId === messages.conversationId) {
          setMessages((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              { senderId: data.senderId, text: data.message },
            ],
          }));
        } else {
          // Optional: Handle messages from other conversations (e.g., notifications)
          console.log("Message from another conversation");
        }
      });

      // Clean up event listeners when dependencies change
      return () => {
        socket.off("getUsers");
        socket.off("getMessage");
      };
    }
  }, [socket, user?.id, messages.conversationId]);

  /**
   * Auto-scroll to the latest message whenever messages update
   */
  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.messages]);

  /**
   * Fetch all conversations for the current user on component mount
   */
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      try {
        console.log(`Fetching conversations for user ID: ${user.id}`);
        const res = await fetch(`http://localhost:9000/user/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include Authorization header if required
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const resData = await res.json();
        console.log("Fetched Conversations:", resData);
        setConversations(resData);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [user?.id]);

  /**
   * Fetch all users (people) excluding the current user on component mount
   */
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;

      try {
        console.log(`Fetching users for user ID: ${user.id}`);
        const res = await fetch(`http://localhost:9000/user/data/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include Authorization header if required
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const resData = await res.json();
        console.log("Fetched Users:", resData);
        setUsers(resData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user?.id]);

  /**
   * Fetch messages for a specific conversation or initiate a new conversation
   * @param {string} conversationId - ID of the conversation or 'new' for a new conversation
   * @param {object} receiver - Details of the receiver user
   */
  const fetchMessages = async (conversationId, receiver) => {
    try {
      if (conversationId === "new") {
        // Check if a conversation with this receiver already exists
        const existingConversation = conversations.find(
          (conv) =>
            (conv.user.receiverId === receiver.receiverId &&
              conv.user.senderId === user.id) ||
            (conv.user.receiverId === user.id &&
              conv.user.senderId === receiver.receiverId)
        );

        if (existingConversation) {
          // If an existing conversation is found, open it
          conversationId = existingConversation.conversationId;
        } else {
          // If no existing conversation, reset messages for a new one
          setMessages({
            messages: [],
            receiver: receiver,
            conversationId: "new",
          });
          return;
        }
      }

      // Fetch existing messages for the selected conversation
      const res = await fetch(
        `http://localhost:9000/user/conversation/${conversationId}?senderId=${user?.id}&receiverId=${receiver?.receiverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const resData = await res.json();
      setMessages({
        messages: resData,
        receiver: receiver,
        conversationId: conversationId,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  /**
   * Send a message to the server and emit via Socket.io
   */
  const sendMessage = async () => {
    console.log("Send button clicked");
    if (!message.trim()) {
      console.warn("Cannot send empty message");
      return; // Prevent sending empty messages
    }
    if (!messages.receiver) {
      console.warn("No receiver selected");
      return; // Ensure a receiver is selected
    }

    try {
      let finalConversationId = messages.conversationId;

      if (finalConversationId === "new") {
        // Create a new conversation first
        console.log("Creating a new conversation...");
        const res = await fetch(`http://localhost:9000/user/conversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: messages.receiver.receiverId,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create a new conversation");
        }

        const resData = await res.json();
        console.log("Conversation creation response:", resData);

        if (resData.conversationId) {
          finalConversationId = resData.conversationId;

          // Update the messages state with the new conversation ID
          setMessages((prev) => ({
            ...prev,
            conversationId: finalConversationId,
          }));

          // Add the new conversation to the conversations list
          setConversations((prev) => [
            ...prev,
            {
              conversationId: finalConversationId,
              user: {
                receiverId: messages.receiver.receiverId,
                email: messages.receiver.email,
                fullName: messages.receiver.fullName,
                image: messages.receiver.image || Img1,
              },
            },
          ]);
        } else {
          console.error("Failed to create a new conversation.");
          return;
        }
      }

      // Emit the message via Socket.io
      console.log("Emitting 'sendMessage' via Socket.io:", {
        senderId: user.id,
        receiverId: messages.receiver.receiverId,
        message: message,
        conversationId: finalConversationId,
      });
      socket.emit("sendMessage", {
        senderId: user.id,
        receiverId: messages.receiver.receiverId,
        message: message,
        conversationId: finalConversationId,
      });

      // Send the message to the backend API
      console.log("Sending message to backend API...");
      const response = await fetch(`http://localhost:9000/user/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: finalConversationId,
          senderId: user.id,
          text: message,
          receiverId: messages.receiver.receiverId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message via API");
      }

      console.log("Message sent successfully via API");

      // **Removed Optimistic Update**
      // The message will be added to the UI via the 'getMessage' Socket.io event.

      // Clear the message input field
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  /**
   * Handle image selection and preview
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /**
   * Handle updating user info
   */
  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("fullName", editedFullName);
      if (editedImage) {
        formData.append("image", editedImage);
      }

      const response = await fetch(
        `http://localhost:9000/api/user/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData, // Using FormData for file upload
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      const updatedUser = await response.json();
      console.log("User updated successfully:", updatedUser);

      // Update user state and localStorage
      setUser(updatedUser);
      localStorage.setItem("user:detail", JSON.stringify(updatedUser));

      // Update image preview if a new image was uploaded
      if (updatedUser.image) {
        setImagePreview(updatedUser.image);
      }

      // Exit edit mode
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("user:detail");
    localStorage.removeItem("user:token");

    // Redirect to the sign-in page
    navigate("/users/sign_in"); // Ensure this route exists in your routing configuration
};


  return (
    <div className="flex flex-col md:flex-row w-screen h-screen relative">
      {/* Left Sidebar: User Info and Conversations */}
      <div className="w-full md:w-1/4 h-full bg-secondary overflow-y-auto relative">
        {/* User Info */}
        <div className="flex items-center my-8 mx-4 sm:mx-2 md:mx-4">
          <div>
            <img
              src={imagePreview}
              alt="User Avatar"
              className="border w-16 h-16 sm:w-12 sm:h-12 border-primary p-1 rounded-full object-cover"
            />
          </div>
          <div className="ml-4 sm:ml-2 flex-1">
            <h3 className="text-xl sm:text-lg">{user?.fullName}</h3>{" "}
            {/* Displaying the user's name */}
            <p className="text-md sm:text-sm font-light">My Account</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-2 rounded"
          >
            Edit
          </button>
        </div>
        <hr className="border-gray-400 mx-4 sm:mx-2" />

        {/* Conversations List */}
        <div className="mx-4 mt-6 sm:mt-4">
          <div className="text-primary text-center text-lg sm:text-base mb-4">
            Messages
          </div>
          {/* conversations */}
          <div>
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }) => (
                <div
                  key={conversationId}
                  className="flex items-center py-4 border-b border-gray-300 cursor-pointer hover:bg-gray-200 rounded"
                  onClick={() => fetchMessages(conversationId, user)}
                >
                  <img
                    src={user.image || Img1} // Use user's image if available, else default
                    alt={`${user?.fullName} Avatar`}
                    className="w-14 h-14 sm:w-10 sm:h-10 rounded-full p-1 border border-primary object-cover"
                  />
                  <div className="ml-4 sm:ml-2">
                    <h3 className="text-lg sm:text-base font-semibold">
                      {user?.fullName}
                    </h3>
                    <p className="text-sm sm:text-xs font-light text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-lg sm:text-base font-semibold mt-16 sm:mt-12">
                No Conversations
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-auto px-4 sm:px-2">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area: Chat Header, Messages, and Send Message */}
      <div className="flex-1 h-full bg-white flex flex-col">
        {/* Chat Header: Displays receiver's details */}
        {messages?.receiver && (
          <div className="w-full bg-secondary h-20 sm:h-16 my-4 px-4 sm:px-2 flex items-center">
            <div>
              <img
                src={messages.receiver.image || Img1} // Use receiver's image if available
                alt="Receiver Avatar"
                className="w-14 h-14 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            </div>
            <div className="ml-4 sm:ml-2 mr-auto">
              <h3 className="text-lg sm:text-base">
                {messages.receiver.fullName}
              </h3>
              <p className="text-sm sm:text-xs font-light text-gray-600">
                {messages.receiver.email}
              </p>
            </div>
            <div className="cursor-pointer">
              {/* Optional: Phone outgoing icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-phone-outgoing w-6 h-6 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="black"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                <line x1="15" y1="9" x2="20" y2="4" />
                <polyline points="16 4 20 4 20 8" />
              </svg>
            </div>
          </div>
        )}

        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-2">
          <div>
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ senderId, text }, index) => (
                <div key={index} className="mb-4 flex">
                  <div
                    className={`max-w-xs sm:max-w-sm lg:max-w-md p-3 rounded-lg ${
                      senderId === user.id
                        ? "bg-blue-500 text-white rounded-tl-lg ml-auto"
                        : "bg-gray-200 text-gray-700 rounded-tr-lg"
                    }`}
                  >
                    {text}
                  </div>
                  <div ref={messageRef}></div>
                </div>
              ))
            ) : (
              <div className="text-center text-lg sm:text-base font-semibold mt-16 sm:mt-12">
                {messages.conversationId
                  ? "No Messages"
                  : "No Conversation Selected"}
              </div>
            )}
          </div>
        </div>

        {/* Send Message Input and Buttons */}
        {messages?.receiver && (
          <div className="p-4 sm:p-2 flex items-center border-t border-gray-300">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 mr-4"
              inputClassName="w-full p-3 sm:p-2 border rounded-full bg-light focus:outline-none"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <div
              className={`p-2 cursor-pointer bg-light rounded-full ${
                !message.trim() ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={sendMessage}
            >
              {/* Send Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-send w-6 h-6 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
              </svg>
            </div>
            <div
              className={`ml-2 p-2 cursor-pointer bg-light rounded-full ${
                !message.trim() ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {/* Add Icon (Optional for additional features like attachments) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-circle-plus w-6 h-6 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="9" x2="12" y2="15" />
                <line x1="9" y1="12" x2="15" y2="12" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: People List */}
      <div className="w-full md:w-1/4 h-full bg-secondary px-4 py-8 overflow-y-auto">
        <div className="text-primary text-lg mb-4">People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ _id, email, fullName, image }) => (
              <div
                key={_id}
                className="flex items-center py-4 border-b border-gray-300 cursor-pointer hover:bg-gray-200 rounded"
                onClick={() =>
                  fetchMessages("new", {
                    receiverId: _id,
                    email,
                    fullName,
                    image, // Pass image if available
                  })
                }
              >
                <img
                  src={image || Img1} // Use user's image if available, else default
                  alt={`${fullName} Avatar`}
                  className="w-14 h-14 sm:w-10 sm:h-10 rounded-full p-1 border border-primary object-cover"
                />
                <div className="ml-4 sm:ml-2">
                  <h3 className="text-lg sm:text-base font-semibold">
                    {fullName}
                  </h3>
                  <p className="text-sm sm:text-xs font-light text-gray-600">
                    {email}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-lg sm:text-base font-semibold mt-16 sm:mt-12">
              No Users Found
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editProfileTitle"
        >
          <div className="bg-white w-11/12 sm:w-96 p-6 rounded-lg shadow-lg">
            <h2 id="editProfileTitle" className="text-xl mb-4">
              Edit Profile
            </h2>
            <form onSubmit={handleUpdateUserInfo}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedFullName}
                  onChange={(e) => setEditedFullName(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditedFullName(user?.fullName || "");
                    setImagePreview(user?.image || Img1);
                    setEditedImage(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
