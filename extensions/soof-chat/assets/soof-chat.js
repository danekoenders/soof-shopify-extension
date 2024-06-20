class ChatBot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.messages = [];
        this.responsePending = true;
        this.userEmail = null;
        this.chatStarted = false;
        this.chatbotData = null;
        this.chatSession = this.getCookie('soofChatSession');

        this.chatIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon"><path d="M2 15V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v15a1 1 0 0 1-1.7.7L16.58 17H4a2 2 0 0 1-2-2z"/><path  d="M6 7h12a1 1 0 0 1 0 2H6a1 1 0 1 1 0-2zm0 4h8a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2z"/></svg>`;
        this.closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" style="display: block; margin: auto; transform: scale(1.5, 1.5);" viewBox="0 0 24 24" class="icon"><path transform="translate(0.5,0)" fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"/></svg>`;
        this.loaderIcon = `<div class="loader"></div>`;
        this.sendButtonIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 500 500"><g><g><polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75"></polygon></g></g></svg>`;
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

        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #393939;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); } /* Start position */
            100% { transform: rotate(360deg); } /* End position, completing a full circle */
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
          border-radius: 50%;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s;
        }
    
        button:hover {
          filter: brightness(90%);
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
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px;
            border-bottom: 1px solid #ccc;
        }
    
        .chat-log .message-wrapper {
            margin-bottom: 10px;
            width: 100%;
        }

        .chat-log .message {
            padding: 12px;
            width: fit-content;
        }

        .chat-log .user {
            display: flex;
            justify-content: flex-end;
        }

        .chat-log .user .message {
            border-radius: 20px 20px 1px;
            background: #dcdcdc;
            color: #000;
        }

        .chat-log .assistant {
            display: flex;
            justify-content: flex-start;
        }

        .chat-log .assistant .message {
            color: #1e1e1e;
            border-radius: 20px 20px 20px 1px;
            border: 2px solid #6d6d6d;
            background: rgb(255, 255, 255);
        }

        .chat-log .assistant-loading .message {
            color: black;
            border-radius: 20px 20px 20px 1px;
            border: 2px solid #6d6d6d;
            background: rgb(255, 255, 255);
        }

        .chat-log .assistant-error .message {
            color: #1e1e1e;
            border-radius: 20px 20px 20px 1px;
            border: 2px solid red;
            background: rgb(255, 255, 255);
        }

        .chat-log .email-input {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .chat-log .email-input button {
            width: 42px;
            height: 42px;
            padding: 10px;
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
          color: white;
          border: none;
          border-radius: 15px;
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

    async connectedCallback() {
        try {
            await this.fetchChatbotData();

            if (this.chatbotData.transcript) {
                this.chatStarted = true;
                const transcriptData = JSON.parse(this.chatbotData.transcript);
                this.messages.push({
                    role: 'assistant',
                    content: `Welkom bij de chat! Ik ben ${this.chatbotData?.customName || "Soof"}, de virtuele assistent🤖 van deze webwinkel. Ik ben in staat de meesten vragen voor je te beantwoorden, stel gerust je eerste vraag of kies één van de suggesties hieronder!`,
                });

                for (const message of transcriptData) {
                    if (message.role === 'user') {
                        this.messages.push({
                            role: message.role,
                            content: message.message,
                        });
                    } else if (message.role === 'assistant') {
                        this.messages.push({
                            role: message.role,
                            content: message.message.reply,
                        });
                    }
                }
            } else {
                this.messages.push({
                    role: 'assistant',
                    content: `Welkom bij ${this.chatbotData?.shop.customName || "onze winkel"}! Vul hieronder je e-mailadres in om een chat te beginnen.`,
                });

                if (!this.chatStarted) {
                    const emailInputSection = `
                    <div class="email-input">
                        <input type="email" name="email" autocomplete="email" placeholder="E-mailadres">
                        <button id="email-send-btn">${this.sendButtonIcon}</button>
                    </div>
                    `;

                    this.messages.push({
                        role: 'assistant',
                        content: emailInputSection,
                    });
                }
            }

            this.renderBase();
        } catch (error) {
            console.error("Error setting up chatbot:", error);
        }
    }

    disconnectedCallback() {
        // Clear any timeouts
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
    }

    async fetchChatbotData() {
        try {
            const response = await fetch('https://soof-app--development.gadget.app/serve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionToken: this.chatSession,
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch');
            this.chatbotData = await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        } else {
            return null;
        }
    }

    async startChat(email) {
        try {
            const emailSendButton = this.shadowRoot.getElementById('email-send-btn');
            emailSendButton.innerHTML = this.loaderIcon;

            const response = await fetch('https://soof-app--development.gadget.app/chatToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                emailSendButton.innerHTML = this.sendButtonIcon;
                throw new Error('Invalid email address. Please try again.');
            }

            const data = await response.json();
            if (data.token) {
                document.cookie = `soofChatSession = ${data.token}; path = /; max-age=3600`;
                this.chatSession = data.token;

                this.messages = [];
                this.messages.push({
                    role: 'assistant',
                    content: `Welkom bij de chat! Ik ben ${this.chatbotData?.customName || "Soof"}, de virtuele assistent🤖 van deze webwinkel. Ik ben in staat de meesten vragen voor je te beantwoorden, stel gerust je eerste vraag of kies één van de suggesties hieronder!`,
                });

                this.responsePending = false; // API call starts
                this.updateSendButtonState();
                this.chatStarted = true;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            this.messages.push({
                role: 'assistant-error',
                content: 'Failed to submit email.',
            });
        }

        this.renderMessages();
    }

    renderBase() {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>
            <button class="toggle-chat-btn">${this.isOpen ? this.closeIcon : this.chatIcon}</button>
            <div class="chat-window">
                <div class="chat-header">
                    <h4>${this.chatbotData?.shop.customName || "Klantenservice"}</h4>
                    <span>Je chat met ${this.chatbotData?.customName || "Soof"}</span>
                </div>
                <div class="chat-log"></div>
                <div class="chat-input">
                    <input name="question" type="text" placeholder="Stel je vraag...">
                    <button class="send-btn" ${this.responsePending ? 'disabled' : ''}>${this.sendButtonIcon}</button>
                </div>
            </div>
        `;

        this.renderMessages();
        this.addBaseEventListeners();
    }

    renderMessages() {
        const chatLog = this.shadowRoot.querySelector('.chat-log');
        if (!chatLog) {
            console.error('Chat log element not found in the DOM.');
            return;
        }

        chatLog.innerHTML = this.messages.map(msg => `
            <div class="message-wrapper ${msg.role}">
                <div class="message">${msg.content}</div>
            </div>
        `).join('');

        this.addMessageEventListeners();
    }

    async sendMessage(message) {
        this.responsePending = true; // API call starts
        this.updateSendButtonState();

        this.messages.push({ role: 'user', content: message });
        const loadingMessageIndex = this.messages.length;
        this.messages.push({ role: 'assistant-loading', content: '...' });
        this.renderMessages();

        // Scroll to the newest message
        const chatLog = this.shadowRoot.querySelector('.chat-log');
        chatLog.scrollTop = chatLog.scrollHeight;

        try {
            const response = await fetch('https://soof-app--development.gadget.app/api/assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionToken: this.chatSession,
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            this.messages.push({
                role: 'assistant',
                content: data.reply,
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            this.messages.push({
                role: 'assistant-error',
                content: 'Sorry, there was an error processing your message. Please try again later.',
            });
        }

        //remove laoding message
        this.messages.splice(loadingMessageIndex, 1)
        this.responsePending = false;
        this.updateSendButtonState();
        this.renderMessages();

        // Return focus to the input field
        const inputField = this.shadowRoot.querySelector('.chat-input input');
        inputField.focus();
        // Scroll to the newest message
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    handleToggleChatClick(event) {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
        this.renderBase();
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
            if (inputField.type === 'email') {
                this.startChat(inputField.value.trim());
                this.clearAndFocusInput(inputField);
            } else if (inputField.type === 'text') {
                this.sendMessage(inputField.value.trim());
                this.clearAndFocusInput(inputField);
            }
        }
    }

    handleEmailSendButtonClick() {
        const emailInputField = this.shadowRoot.querySelector('.email-input input[type="email"]');
        if (emailInputField.value.trim()) {
            this.startChat(emailInputField.value.trim());
            this.clearAndFocusInput(emailInputField);
        }
    }

    clearAndFocusInput(inputField) {
        inputField.value = '';
        inputField.focus();
    }

    updateSendButtonState() {
        const sendButton = this.shadowRoot.querySelector('.send-btn');
        if (this.responsePending) {
            sendButton.setAttribute('disabled', 'disabled');
        } else {
            sendButton.removeAttribute('disabled');
        }
    }

    addBaseEventListeners() {
        this.shadowRoot.querySelector('.toggle-chat-btn').addEventListener('click', this.handleToggleChatClick.bind(this));
        this.shadowRoot.querySelector('.send-btn').addEventListener('click', this.handleSendButtonClick.bind(this));
        this.shadowRoot.querySelector('.chat-input input').addEventListener('keydown', this.handleInputKeydown.bind(this));
    }

    addMessageEventListeners() {
        if (!this.chatStarted) {
            this.shadowRoot.querySelector('.email-input input').addEventListener('keydown', this.handleInputKeydown.bind(this));
            this.shadowRoot.getElementById('email-send-btn').addEventListener('click', this.handleEmailSendButtonClick.bind(this));
        }
    }
}

// Define the new element
if (!customElements.get('soof-chat')) {
    customElements.define('soof-chat', ChatBot);
}