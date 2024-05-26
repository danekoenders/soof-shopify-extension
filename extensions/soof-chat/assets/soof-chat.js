const chatIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
    <path d="M2 15V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v15a1 1 0 0 1-1.7.7L16.58 17H4a2 2 0 0 1-2-2z"/>
    <path  d="M6 7h12a1 1 0 0 1 0 2H6a1 1 0 1 1 0-2zm0 4h8a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2z"/>
    </svg>
    `;

const closeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: block; margin: auto; transform: scale(1.5, 1.5);" viewBox="0 0 24 24" class="icon">
      <path transform="translate(0.5,0)" fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"/>
    </svg>
    `;

class ChatBot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.messages = [];
        this.loadingTimeout = null;
        this.apiPending = false;
        this.userEmail = null; // Variable to store user email
        this.chatbotData = null; // Variable to store fetched data
    }

    get styles() {
        return `
        :host {
          display: block;
          position: fixed; /* Change to fixed position */
          bottom: 25px; /* Adjust the distance from the bottom */
          right: 25px; /* Adjust the distance from the right */
          z-index: 9999; /* Ensure the chat bot appears above other content */
        }

        .chat-window {
            display: ${this.isOpen ? 'flex' : 'none'};
            width: 450px;
            height: 750px;
            position: absolute;
            bottom: 80px;
            right: 0;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            flex-direction: column; /* Stack children vertically */
            font-size 16px;
            line-height: 20px;
        }
    
        .icon {
          fill: white;
        }

        svg {
            fill: white;
        }

        input {
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 0.9em;
            width: 180px;
        }
    
        button {
          width: 60px; 
          height: 60px; 
          padding: 10px;
          background-color: ${this.chatbotData.primaryColor || '#0070f3'};
          border-radius: 50%; /* Makes the button circular */
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s;
        }
    
        button:hover {
          filter: brightness(90%);
        }
    
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #ccc;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
    
        .close-btn:hover {
          background-color: #aaa;
        }

        .chat-header {
            background: linear-gradient(to right, ${this.chatbotData.primaryColor || '#0070f3'}, ${this.chatbotData.secondaryColor || '#00e676'});
            color: white;
            padding: 10px 20px;
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            display: flex;
            flex-direction: column;
            line-height: 1.2;
            font-size: 1.2em;
        }

        .chat-header h4 {
            margin: 0;
        }

        .chat-header span {
            font-size: 0.8em;
        }
    
        .chat-log {
            display: flex;
            flex-direction: column;
            flex-grow: 1; /* Allow chat-log to take up available space */
            overflow-y: auto; /* Enable vertical scrolling */
            padding: 10px;
            border-bottom: 1px solid #ccc;
        }
    
        .chat-log .message-wrapper {
            margin-bottom: 10px;
            width: 100%;
        }

        .chat-log .user {
            display: flex;
            justify-content: flex-end;
        }

        .chat-log .user .message {
            padding: 12px;
            border-radius: 20px 20px 1px;
            background: #dcdcdc;
            color: #000;
            width: fit-content;
        }

        .chat-log .assistant {
            display: flex;
            justify-content: flex-start;
        }

        .chat-log .assistant .message {
            padding: 12px;
            color: #1e1e1e;
            border-radius: 20px 20px 20px 1px;
            border: 2px solid #6d6d6d;
            background: rgb(255, 255, 255);
            width: fit-content;
        }

        .chat-log .assistant.email-input .message {
            padding: 5px 10px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .chat-log .assistant.email-input button {
            width: 42px;
            height: 42px;
            padding: 10px;
        }
    
        .chat-log .assistant-loading {
            font-style: italic;
            color: #0070f3;
            display: flex;
            justify-content: center; /* Center the dots horizontally */
        }
        
        .chat-log .assistant-loading span {
            animation: fadeInOut 1.2s infinite;
            opacity: 0; /* Start with an invisible state */
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        
        /* Stagger the animation of each dot */
        .chat-log .assistant-loading span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .chat-log .assistant-loading span:nth-child(2) {
            animation-delay: 0.4s;
        }
        
        .chat-log .assistant-loading span:nth-child(3) {
            animation-delay: 0.8s;
        }
    
        .chat-input {
          display: flex;
          padding: 5px; /* Reduced padding */
          background-color: #f7f7f7; /* Optional: Different background for clarity */
          border-bottom-left-radius: 15px;
          border-bottom-right-radius: 15px;
        }
    
        .chat-input input {
          flex-grow: 1;
          padding: 5px 10px; /* Reduced padding */
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px; /* Reduced font size */
        }
    
        .chat-input button {
          margin-left: 5px; /* Reduced margin */
          padding: 5px 10px; /* Reduced padding */
          font-size: 14px; /* Reduced font size */
        }
    
        .send-btn {
          padding: 5px 15px; /* Adjusted padding for better appearance */
          background-color: #0070f3; /* Color to match the theme */
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
          font-size: 14px; /* Consistent with the input field */
        }
    
        .send-btn[disabled] {
          background-color: #b3b3b3; /* Grayed out color */
          cursor: not-allowed;
        }
    
        .send-btn:hover {
          background-color: #0051bb; /* Darker shade on hover */
        }

        `;
    }

    async fetchChatbotData() {
        try {
            const response = await fetch('https://soof-app--development.gadget.app/serve');
            if (!response.ok) throw new Error('Failed to fetch');
            this.chatbotData = await response.json();
            this.render(); // Render the component after data is fetched
            this.renderMessages();
            this.addEventListeners(); // Attach event listeners after rendering
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    async connectedCallback() {
        await this.fetchChatbotData(); // Fetch data when component is attached to the DOM
        this.messages.push({
            role: 'assistant',
            content: 'Welkom! Vul hieronder je e-mailadres in om een chat te beginnen.',
        });
        this.render();
        this.addEventListeners();
    }

    disconnectedCallback() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.render();
        this.addEventListeners(); // Re-attach event listeners after rendering
    }

    async sendMessage(message) {
        this.messages.push({ role: 'user', content: message });
        this.render();
        this.addEventListeners();

        // Add a "loading..." message
        const loadingMessage = {
            role: 'assistant-loading',
            content: '...',
        };
        this.messages.push(loadingMessage);
        this.render();
        this.addEventListeners();

        this.apiPending = true; // API call starts
        this.updateSendButtonState();

        // Scroll to the newest message
        const chatLog = this.shadowRoot.querySelector('.chat-log');
        if (chatLog) {
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        // Set a minimum display time for "loading..."
        this.loadingTimeout = setTimeout(async () => {
            // Remove the "loading..." message
            this.messages = this.messages.filter((msg) => msg !== loadingMessage);

            // Send the user's message to the server
            try {
                const response = await fetch('http://localhost:3000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages: this.messages.slice(-10) }), // Assuming the server expects a JSON payload with a "message" key
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Assuming the server returns a JSON object with a "content" key for the bot's reply
                this.messages.push({
                    role: 'assistant',
                    content: data.content || "Sorry, I didn't understand that.",
                });
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                this.messages.push({
                    role: 'assistant',
                    content: 'Sorry, there was an error processing your message.',
                });
            }

            this.apiPending = false;
            this.render();
            this.addEventListeners();

            // Return focus to the input field
            const inputField = this.shadowRoot.querySelector('.chat-input input');
            if (inputField) {
                inputField.focus();
            }
            // Scroll to the newest message
            const chatLog = this.shadowRoot.querySelector('.chat-log');
            if (chatLog) {
                chatLog.scrollTop = chatLog.scrollHeight;
            }
        }, 10000); // Display "loading..." for at least 10 seconds
    }

    render() {
        const emailInputSection = this.userEmail ? '' : `
            <div class="message-wrapper assistant email-input">
                <div class="message">
                    <input type="email" name="email" autocomplete="email" placeholder="E-mailadres">
                    <button>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 500 500"><g><g><polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75"></polygon></g></g></svg>
                    </button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>
            <button class="toggle-chat-btn">${this.isOpen ? closeIcon : chatIcon}</button>
            <div class="chat-window">
                <div class="chat-header">
                    <h4>${this.chatbotData?.shop.customName || "Klantenservice"}</h4>
                    <span>Je chat met ${this.chatbotData?.customName || "Soof"}</span>
                </div>
                <button class="close-btn">×</button>
                <div class="chat-log">
                    ${emailInputSection}
                </div>
                <div class="chat-input">
                    <input type="text" placeholder="Stel je vraag...">
                    <button class="send-btn" ${this.apiPending ? 'disabled' : ''}>Send</button>
                </div>
            </div>
        `;
    }

    renderMessages() {
        const chatLog = this.shadowRoot.querySelector('.chat-log');
        if (!chatLog) return;
        
        chatLog.innerHTML = this.messages
            .map((msg) => {
                if (msg.role === 'assistant-loading') {
                    return `
                    <div class="message-wrapper assistant-loading ${msg.role}">
                        <div class="message"><span>.</span><span>.</span><span>.</span></div>
                    </div>`;
                }

                return `
                    <div class="message-wrapper ${msg.role}">
                        <div class="message">${msg.content}</div>
                    </div>
                `;
            })
            .join('');
    }

    handleToggleChatClick(event) {
        event.stopPropagation();
        this.toggleChat();
    }

    handleCloseButtonClick(event) {
        event.stopPropagation();
        this.toggleChat();
    }

    handleSendButtonClick() {
        const inputField = this.shadowRoot.querySelector('.chat-input input');
        if (inputField.value.trim()) {
            this.sendMessage(inputField.value.trim());
            this.clearAndFocusInput(inputField);
        }
    }

    handleInputKeydown(e) {
        const inputField = e.target;
        if (e.key === 'Enter' && inputField.value.trim()) {
            this.sendMessage(inputField.value.trim());
            this.clearAndFocusInput(inputField);
        }
    }

    handleEmailSendButtonClick() {
        const emailInputField = this.shadowRoot.querySelector('.email-input input[type="email"]');
        if (emailInputField.value.trim()) {
            this.startChat(emailInputField.value.trim());
            emailInputField.value = ''; // Clear the input after sending
        }
    }

    async startChat(email) {
        try {
            const response = await fetch('https://soof-app--development.gadget.app/chatToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit email');
            }

            const data = await response.json();
            this.chatbotData.userEmail = email; // Store email locally or in fetched data
            if (data.token) {
                document.cookie = `soofChatToken=${data.token}; path=/; max-age=3600`;
            }
            this.messages.push({
                role: 'assistant',
                content: 'Email submitted successfully. You can now start chatting.',
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            this.messages.push({
                role: 'assistant',
                content: 'Failed to submit email.',
            });
        }

        this.render();
    }

    clearAndFocusInput(inputField) {
        inputField.value = '';
        inputField.focus();
    }

    updateSendButtonState() {
        const sendButton = this.shadowRoot.querySelector('.send-btn');
        if (this.apiPending) {
            sendButton.setAttribute('disabled', 'disabled');
        } else {
            sendButton.removeAttribute('disabled');
        }
    }

    addEventListeners() {
        this.shadowRoot.querySelector('.toggle-chat-btn').addEventListener('click', this.handleToggleChatClick.bind(this));
        this.shadowRoot.querySelector('.close-btn').addEventListener('click', this.handleCloseButtonClick.bind(this));
        this.shadowRoot.querySelector('.send-btn').addEventListener('click', this.handleSendButtonClick.bind(this));
        this.shadowRoot.querySelector('.chat-input input').addEventListener('keydown', this.handleInputKeydown.bind(this));
        const emailSendButton = this.shadowRoot.querySelector('.email-send-btn');
        if (emailSendButton) {
            emailSendButton.addEventListener('click', this.handleEmailSendButtonClick.bind(this));
        }
    }
}

// Define the new element
if (!customElements.get('soof-chat')) {
    customElements.define('soof-chat', ChatBot);
}