
const socket=io();

$messageForm=document.querySelector("#message_form");
$messageFormInput=document.querySelector("#message_form").message;
$messageFormButton=$messageForm.querySelector("button");
$sendLocation=document.querySelector("#send_location");
// Select the element in which you want to render the template
$message=document.querySelector("#messages");
//rendering message template
$messageTemplate=document.querySelector("#message-template").innerHTML;
//rendering location message template
$locationMessageTemplate=document.querySelector("#location-message-template").innerHTML;
$sidebar=document.querySelector(".chat__sidebar");
$sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $message.offsetHeight
    // Height of messages container
    const containerHeight = $message.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight
    }
   }

socket.on("message",(message)=>{
    console.log(message);
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.on("location-message",(message)=>{
    console.log(message);
    const html=Mustache.render($locationMessageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    //disable button
    $messageFormButton.setAttribute("disabled","disabled");

    const message=e.target.message.value;
    if(!message){
        //enable button
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.focus();
        return ;
    }
    socket.emit("send_message",{message,username,room},(error)=>{
        //enable button
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value="";
        $messageFormInput.focus();

        if(error){
           return console.log(error);
        }
        console.log("Message Delivered");
    });
})

$sendLocation.addEventListener("click",(e)=>{

    if(!navigator.geolocation){
        return alert("geolocation not supported by your browser");
    }
    
    //Disable button
     $sendLocation.setAttribute("disabled","disabled");

    navigator.geolocation.getCurrentPosition((position)=>{
        //enable button
        $sendLocation.removeAttribute("disabled");

        socket.emit("send-location",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(callback)=>{
            console.log("LOCATION_DELIVERED",callback);
        })
    })
})

socket.emit("join",{ username , room},(error)=>{
    if(error){
        alert(error);
        location.href="/";
    }
})

socket.on("roomData",({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML=html;
})

// socket.on("count_updated",(count)=>{
//     console.log("count updated",count);
// })

// document.querySelector("#my_form").addEventListener("submit",(e)=>{
//    e.preventDefault();
//    socket.emit("count_increment");
// })