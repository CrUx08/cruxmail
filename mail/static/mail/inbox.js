document.addEventListener('DOMContentLoaded', function () {
  const inboxBtn = document.querySelector('#inbox');
  const sentBtn = document.querySelector('#sent');
  const archivedBtn = document.querySelector('#archived');
  const composeBtn = document.querySelector('#compose');


  if (inboxBtn) inboxBtn.addEventListener('click', () => load_mailbox('inbox'));
  if (sentBtn) sentBtn.addEventListener('click', () => load_mailbox('sent'));
  if (archivedBtn) archivedBtn.addEventListener('click', () => load_mailbox('archive'));
  if (composeBtn) composeBtn.addEventListener('click', compose_email);

  // Only run this if you're in the mail app, not login page
  if (inboxBtn) load_mailbox('inbox');
});


function nextfun(event){
  event.preventDefault();
  const email = document.querySelector('#email');

  console.log('clicked')
  document.querySelector('#right1').style.display = 'none';
  document.querySelector('#right2').style.display = 'block';
  
  }
function closecomp(){
    console.log('clicked');
    document.querySelector(".compose-container").style.display = 'none';
  }
function resize(){
  document.querySelector(".compose-container").style.width = '60%';
  document.querySelector(".compose-container").style.marginLeft = '5%';
  document.querySelector(".compose-top").style.gap = '72.5%';
}  
function profile(){
  document.querySelector('.profile').style.display = 'block';
}


function compose_email() {

  // Show compose view and hide other views
  
  document.querySelector('.compose-container').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector(".compose-container").style.width = '';
  document.querySelector(".compose-container").style.marginLeft = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views

  document.querySelector('.compose-container').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('.mailbox-left').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  console.log(mailbox)
    fetch(`/emails/${mailbox}`)
     .then(response => response.json())
     .then(emails => {
     // Print emails
      console.log(emails);
     const message = document.querySelector('.messagearea');
     message.innerHTML = '';
    // ... do something else with emails ... 
    if (emails.length > 0){
      document.querySelector('.nomessages').style.display = "none";

      if (mailbox === 'sent'){
        for( let i = 0;i < emails.length;i++ ) {
          message.innerHTML+=`
          <div class="messages" onclick = 'viewmail(${emails[i].id})' data-id="${emails[i].id}"style="background-color: ${emails[i].read  ? 'rgba(151, 218, 245, 0.32)' : 'white'}">
                           
                           <div class="messageleft">
                               <ion-icon name="square-outline"></ion-icon>
                               
                               <div class="messagetext">${emails[i].recipients}</div>
                           </div>
                             <div class="messagesub">${emails[i].subject}
                             </div>
                             <div class="messageright">
                               <div class="messagetime">${emails[i].timestamp}</div> <ion-icon name="trash"></ion-icon> 
                           </div>
                         </div>`
     }
       }else{
        for( let i = 0;i < emails.length;i++ ) {
          message.innerHTML+=`
          <div class="messages" onclick = 'viewmail(${emails[i].id})' data-id="${emails[i].id}"style="background-color: ${emails[i].read ? 'rgba(151, 218, 245, 0.32)' : 'white'}">
                           
                           <div class="messageleft">
                               <ion-icon name="square-outline"></ion-icon>
                              
                               <div class="messagetext">${emails[i].sender}</div>
                           </div>
                             <div class="messagesub">${emails[i].subject}
                             </div>
                             <div class="messageright">
                               <div class="messagetime">${emails[i].timestamp}</div> <ion-icon name="trash"></ion-icon> <ion-icon name="archive-outline" onclick = "event.stopPropagation(); archive(${emails[i].id},${emails[i].archived})"></ion-icon>
                           </div>
                         </div>`
     }
       }
    }else{
      document.querySelector('.nomessages').style.display = "block";
    }
    

});
}


function sendmail(event){
  event.preventDefault();
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);    
      load_mailbox("sent");
  });
  
   console.log("done");
}

function viewmail(id){
  const mailview = document.querySelector('.messagearea');
  mailview.innerHTML = '';
  fetch(`/emails/${id}`)
   .then(response => response.json())
   .then(email => {
    // Print email
    console.log(email);
    fetch(`/emails/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          read: true
      })
    });

    // ... do something else with email ...
    mailview.innerHTML += `
    <div class="mailview">
    <div class="mailtit"><h3>${email.subject}</h3></div>
   <div class="sendprof">
       <div class="profleft"><img src="${userprof}" alt="" class="user">
           <div class="name">${email.sender}</div></div>
       <div class="profright"> 
           ${email.timestamp} (1 day ago) <button class="btn btn-sm btn-outline-primary" onclick ="replymail(${email.id})">Reply</button></div>
       </div>
     <div class="mailbody">
       <p> ${email.body}</p>
     </div>
     <div class="mailbott">
       <button class="reply" onclick ="replymail(${email.id})">Reply</button>
     </div>
  </div>
    
    `
  
});

}
function replymail(id){
  fetch(`/emails/${id}`)
   .then(response => response.json())
   .then(email => {
    // Print email
    console.log(email);
    console.log('called');
    document.querySelector('.compose-container').style.display = 'block';
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject} `;
    document.querySelector('#compose-body').value = `"on ${email.timestamp} ${email.sender} wrote: ${email.body}"`
    
})
 
}
function archive(id,currentstate){
  
  const state = !currentstate;
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: state
    })
  })
  .then(()=>{
    if (state){
      load_mailbox("archive")
    }else{
      load_mailbox("inbox")
    }
  })
}