const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const{Username,Room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll= () =>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight >= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight

    }
}


socket.on('message',(message) => {
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        Username:message.Username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message) =>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        Username:message.Username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({Room,users}) =>{
    const html=Mustache.render(sidebarTemplate,{
        Room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable
    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus();
        //enable
        if(error){
            return console.log(error)
        }
        console.log('Delivered!!!')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
         //console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})


socket.emit('join',{Username,Room},(error) =>{
    if(error){
        alert(error)
        location.href='/'
    }
})