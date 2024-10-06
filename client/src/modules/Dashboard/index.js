import React, { useState } from "react";
import Avtar from "../../asset/profile-user-svgrepo-com.svg";
import Input from "../../components/input/index";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [senderMessages, setSenderMessages] = useState([]);
  const [receiverMessages, setReceiverMessages] = useState([]);
  const contacts = [
    {
      name: "Abhijeet",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Sanket",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Amrit",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Pankaj",
      status: "Available",
      img: Avtar,
    },
    {
      name: "System",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Shubham",
      status: "Available",
      img: Avtar,
    },
    {
      name: "System",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Shubham",
      status: "Available",
      img: Avtar,
    },
    {
      name: "System",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Shubham",
      status: "Available",
      img: Avtar,
    },
    {
      name: "System",
      status: "Available",
      img: Avtar,
    },
    {
      name: "Shubham",
      status: "Available",
      img: Avtar,
    },
  ];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      setSenderMessages([...senderMessages, { message, sender: "me" }]);
      setMessage("");
    }
  };

  const handleReceiveMessage = (message) => {
    setReceiverMessages([...receiverMessages, { message, sender: "other" }]);
  };

  return (
    <div className="w-screen h-screen flex flex-wrap md:flex-nowrap">
      {/* left sidebar */}
      <div className="w-full md:w-[25%] h-screen bg-gray-100 md:border-r border-r-gray-300">
        {/* profile section */}
        <div className="flex justify-center items-center xl:my-8 md:my-6 sm:my-4 xl:mx-14 md:10 sm:8">
          {/* profile image */}
          <div>
            <img
              className="border border-primary p-[1px] rounded-full sm:p-[1.5px] md:p-[2px] lg:p-[2.5px] xl:p-[2px] "
              src={Avtar}
              alt=""
              width={60}
              height={60}
            />
          </div>
          {/* profile info */}
          <div className="ml-8">
            <h3 className="xl:text-2xl md:text-xl sm:text-lg">Profile Name</h3>
            <p className="xl:text-lg md:text-md sm:text-sm font-light">
              My Account
            </p>
          </div>
        </div>
        {/* search bar */}
        <div className="w-full p-4">
          <input
            type="text"
            className="w-full p-2 pl-10 text-sm text-gray-700 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:bg-white"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* message section */}
        <div className="overflow-y-scroll h-[60vh] w-full">
          {filteredContacts.map(({ name, status, img }) => {
            return (
              <div className="flex items-center xl:py-4 md:py-2 sm:py-1 sm:my-4 border-b border-b-gray-300">
                {/* contact image and info */}
                <div className="cursor-pointer flex items-center">
                  <img src={img} alt="" width={30} height={30} />

                  <div className="ml-8">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-sm font-light text-gray-700">{status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* chat section */}
      <div className="w-full md:w-[50%]  h-screen bg-white flex flex-col items-center">
        {/* chat header */}
        <div className="w-full bg-gray-100 p-4 flex justify-between items-center">
          {/* chat profile image */}
          <div className="cursor-pointer">
            <img src={Avtar} alt="" width={30} height={30} />
          </div>
          {/* chat profile info */}
          <div className="ml-6 mr-auto">
            <h3 className="text-lg ">Abhijeet</h3>
            <p className="text-sm font-light text-gray-600">online</p>
          </div>
          {/* call button */}
          <div className="cursor-pointer mr-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-phone-outgoing"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2c-8.072 -.49 -14.51 -6.928 -15 -15a2 2 0 0 1 2 -2" />
              <path d="M15 5h6" />
              <path d="M18.5 7.5l2.5 -2.5l-2.5 -2.5" />
            </svg>
          </div>
        </div>
        {/* chat messages */}
        <div className="h-[85vh] w-full overflow-y-scroll p-4">
          {senderMessages.map((msg, index) => {
            return (
              <div key={index} className="flex justify-end mb-4">
                <div className="bg-blue-500 p-2 rounded-lg rounded-tr-none max-w-xs ml-2">
                  <p className="text-sm text-white">{msg.message}</p>
                </div>
              </div>
            );
          })}
          {receiverMessages.map((msg, index) => {
            return (
              <div key={index} className="flex justify-start mb-4">
                <div className="bg-gray-200 p-2 rounded-lg rounded-tl-none max-w-xs mr-2">
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* chat input */}
        <div className="w-full ml-8  flex item-center ">
          <Input
            type="text"
            className="w-full p-2 pl-10 text-sm text-gray-700 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:bg-white"
            placeholder="Type a message..."
            value={message}
            height={40}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div
            className="cursor-pointer bg-blue-500 text-white p-2 ml-2 rounded-lg"
            onClick={handleSendMessage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-send"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 14l11 -11" />
              <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          </div>
          <div className="cursor-pointer bg-blue-500 text-white p-2 ml-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
              <path d="M9 12h6" />
              <path d="M12 9v6" />
            </svg>
          </div>
        </div>
      </div>
      {/* right sidebar */}
      <div className="w-full md:w-[25%]  h-screen bg-gray-100"></div>
    </div>
  );
};

export default Dashboard;
