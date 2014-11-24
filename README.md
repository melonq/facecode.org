<<<<<<< HEAD
#WebRTC Rails

This is a basic aplication I have build to test WebRTC, my main objective is to practice WebRTC. I will slowly improve the aplication, and add more features each time.

##Start Now

To start the project and test is at your own you have to do the following:

1. Clone the repo: ```git clone git@github.com:XescuGC/webrtc-rails.git```
2. Install all the gems with ```bundle install```
3. Go to ```app/rtc/``` and run ```npm install``` to install ```socket.io```
4. Check to see your IP: ```ifconfig```, copy the IP and change the ones in ```public/javascripts/rtc/client_signaling.js``` and at the first line change the ```io.connect('YOUR-IP:2013')```
5. Open the server ```rails server```
6. Open the NodeJs server ```node app/rtc/server.js```
7. Go to the URL: ```localhost:3000```
8. ENJOY!

##Test it in production

Here you have the [link](http://webrtc-rails.layeris.com)

**At the moment it only works between Chrome and Chrome (I'm currently working on the problem)**


##Objectives

As I said before the main objective is to practice WebRTC but I will list some of the other objectives I have in mind:

1. **DONE** WebRTC between 2 peers
2. **DONE** Clean the webpage of unneeded menus, just the Home page and a page to call
3. **DONE** Add a chat module (with NodeJs, latter can be improved to be with arbitrary data with RTCDataChannel)
4. Control of errors in the Call (on of the Peers leave ... etc)
5. **DONE** Ability to create your own rooms with diferets names, and to setup an user name (for the Chat)
6. Ability to activate and desactivate Video or Audio, and reactivate them 
7. Room with more than 2 Peers
8. Stream Data to more than 3 people (one to more only), like a conference
9. Change the Rails server for more JS? (NodeJs with Backbone.Marionette ... jeje)

##Slides

I've made a short Presentation of WebRTC in my Office, here are the [Slides](https://github.com/XescuGC/webrtc-slides)

##Collaborate

You can participate with whatever you want, and use/fork this code (if you find it usefull) for whatever you want ofcourse. If you want to propose more ideas will be welcome jeje

##Contact

email: xescugil@gmail.com

twitter: [@xescugc](https://twitter.com/xescugc)
=======
facecode.org
============

An interview website for programmers
>>>>>>> 5f58303c062d0a065ee2310611b805879f23d994
