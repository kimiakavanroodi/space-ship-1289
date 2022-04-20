// Import the functions you need from the SDKs you need
const firebase = require('firebase/app');
const firebaseAdmin = require("firebase/auth")
const socket = require("socket.io-client")

let io = socket.io("http://localhost:8080")

io.on('connect', (ok) => { 
  console.log('love')
  io.emit("chats", "chats-625c9e3a46889398cc7fb863");

  io.on('UPDATE_CHAT', (data) => {
    console.log(data.messages)
  })
});

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB9ztVSFuTKeyJU7EL8Z87OdgYPYtIzYHw",
//   authDomain: "match-84338.firebaseapp.com",
//   projectId: "match-84338",
//   storageBucket: "match-84338.appspot.com",
//   messagingSenderId: "204021989546",
//   appId: "1:204021989546:web:d608f3f13a26c1b2efd0d3"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// const app = firebaseAdmin.getAuth()


// firebaseAdmin.signInWithEmailAndPassword(app, "testing-stylist-12345@gmail.com", "kimia123456").then(async(user) => {
//     console.log(await (await user.user.getIdTokenResult(true)).token)
//     console.log(user.user.uid)
// })


// {
//     "email": "testing-style-seeker-2@gmail.com",
//     "role": "style-seeker",
//     "password": "kimia123456",
//     "name": "kim",
//     "age": 25
// }

// firebaseAdmin.signInWithEmailAndPassword(app, "testing-style-seeker-2@gmail.com", "kimia123456").then(async(user) => {
//     console.log(await (await user.user.getIdTokenResult(true)).token)
// })

