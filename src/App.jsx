import { useState, useEffect, useRef } from "react";

function App() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const inputRef = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

  const getMessages = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(
        "http://localhost:3030/completions",
        options
      );
      const data = await response.json();
      console.log(data);
      if (data.choices && data.choices.length > 0) {
        setMessage(data.choices[0].message);
      } else {
        console.error("No valid response from OpenAI");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(currentTitle, value, message);
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: "user",
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
      setValue("");
      inputRef.current?.focus();
    }
  }, [message, currentTitle]);

  // Add a handler for the Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      getMessages();
    }
  };

  const currentChat = previousChats.filter(
    (previousChat) => previousChat.title === currentTitle
  );
  const uniqueTitles = Array.from(
    new Set(previousChats.map((previousChat) => previousChat.title))
  );

  return (
    <div className="app">
      <section className="sideBar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Made by Anna-Sara</p>
        </nav>
      </section>
      <section className="main">
        {!currentTitle && <h1>AnpieGPT</h1>}

        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li
              key={index}
              className={
                chatMessage.role === "user" ? "userMessage" : "aiMessage"
              }
            >
              {/* <p className="role">{chatMessage.role}</p> */}
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottomSection">
          <div className="inputContainer">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div id="submit" onClick={getMessages}>
              ►
            </div>
          </div>
          <p className="info">This chat bot uses the OpenAi API.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
