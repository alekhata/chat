'use strict';
 
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('#connecting');
var stompClient = null;
var username = null;
  
function connect() 
{
    username = document.querySelector('#username').innerText.trim();   
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket); 
    stompClient.connect({}, onConnected, onError);
}
 
// Konektovanje na WebSocket server.
connect();
 
function onConnected() 
{
    // Unošenje imena
    stompClient.subscribe('/topic/publicChatRoom', onMessageReceived);
 
    // Slanje imena
    stompClient.send("/app/chat.addUser",{},JSON.stringify({sender: username, type: 'JOIN'})
    ) 
    connectingElement.classList.add('hidden');
} 
 
function onError(error) 
{
    connectingElement.textContent = 'Nemoguće je konektovati se na WebSocket server. Pokušajte ponovo osvežavanjem stranice!';
    connectingElement.style.color = 'red';
} 
 
function sendMessage(event) 
{
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) 
    {
        var chatMessage = 
        {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}
  
function onMessageReceived(payload) 
{
    var message = JSON.parse(payload.body);
 
    var messageElement = document.createElement('li');
 
    if(message.type === 'JOIN') 
    {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' ušao/la!';
    } 
    else if (message.type === 'LEAVE') 
    {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' izašao/la!';
    } 
    else 
    {
        messageElement.classList.add('chat-message');   
        var usernameElement = document.createElement('strong');
        usernameElement.classList.add('nickname');
        var usernameText = document.createTextNode(message.sender);
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }    
    var textElement = document.createElement('span');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText); 
    messageElement.appendChild(textElement); 
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}
 
messageForm.addEventListener('submit', sendMessage, true);