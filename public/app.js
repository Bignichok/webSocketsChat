const socket = io("ws://localhost:4040");

const messageEditor = document.querySelector("#message-editor");
const feed = document.querySelector("#message-feed");

const userName = prompt("Your name?") || "Anonymous";

socket.emit("user/joinChat", userName);

socket.on("user/joinChatSuccess", (message) => {
  console.log(message);
});

socket.on("chat/userJoined", (message) => {
  console.log(message);
});

socket.on("chat/newMessage", appendMessageToFeed);

socket.on("user/connected", (history) => {
  const markup = history
    .map(({ author, message, timestamp }) => {
      const { hours, minutes, seconds } = getTime(timestamp);

      return `<li>
        <b>${author}</b> ${hours}:${minutes}:${seconds}
        <p>${message}</p>
      </li>`;
    })
    .join("");

  feed.insertAdjacentHTML("beforeend", markup);
});

messageEditor.addEventListener("submit", onEditorSubmit);

function onEditorSubmit(e) {
  e.preventDefault();

  socket.emit("chat/newMessage", e.currentTarget.elements.message.value);
  e.currentTarget.elements.message.value = "";
}

function appendMessageToFeed({ author, message, timestamp }) {
  const { hours, minutes, seconds } = getTime(timestamp);

  const markup = `
  <li>
    <b>${author}</b> ${hours}:${minutes}:${seconds}
    <p>${message}</p>
  </li>`;

  feed.insertAdjacentHTML("beforeend", markup);
  feed.scrollTop = feed.scrollHeight;
}

function getTime(timestamp) {
  const time = new Date(timestamp);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return { hours, minutes, seconds };
}
