const typingForm = document.querySelector(".typing-form");
const chatlist = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteButton = document.querySelector("#delete-chat-button");

let userMessage = null;

const API_KEY = "AIzaSyDTNYHu-bkzmSC2MaXNO9DcotBtmjcfxXU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
            textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
            currentWordIndex++;
        } else {
            clearInterval(typingInterval);
        }
    }, 75);
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn’t get that.";
        showTypingEffect(apiResponse, textElement);
    } catch (error) {
        console.log(error);
        textElement.innerText = "Error getting response!";
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

const showLoadingAnimation = () => {
    const html = `
        <div class="message content">
            <img src="gemini.svg" alt="bot image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatlist.appendChild(incomingMessageDiv);
    generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
};

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-window").value.trim();
    if (!userMessage) return;

    const html = `
        <div class="message content">
            <img src="userrrr.jpg" alt="user image" class="avatar">
            <p class="text">${userMessage}</p>
        </div>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    chatlist.appendChild(outgoingMessageDiv);
    typingForm.reset();

    // Hide header
    document.body.classList.add("hide-header");

    // Simulate delay before bot responds
    setTimeout(showLoadingAnimation, 500);
};

// Toggle theme
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Submit message
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

// Clear chat and show header
deleteButton.addEventListener("click", () => {
    chatlist.innerHTML = "";
    document.body.classList.remove("hide-header");
});

// Handle suggestion click
document.querySelectorAll(".suggestion").forEach(item => {
    item.addEventListener("click", () => {
        const text = item.querySelector(".text").innerText;
        typingForm.querySelector(".typing-window").value = text;
        handleOutgoingChat();
    });
});
