  var user_name = prompt("Your user name?");

  var $sendButton = $("#js-send-button-im");
  var $inputIM    = $("#js-input-im");
  var $chatBody   = $("#js-chat-body");

  $sendButton.on('click', sendIM);
  $inputIM.on('keypress', checkEnterKey);

  function sendIM() {
    var content = $inputIM.val();
    $inputIM.val("");
    socket.emit('message',{message: {content: content, user: user_name}, type: 'im', room: room});
  }

  function checkEnterKey(event) {
    if ( event.keyCode == 13 ) {
      $sendButton.click();
    }
  }

  function appendNewIM(user, message) {
    $chatBody.prepend(mediaObjectIM(user, message));
  }

  function mediaObjectIM(user, message) {
    var leftRight = user === user_name ? 'right' : 'left'
    return "  <div class='media'>"+
           "    <a class='pull-"+ leftRight +"' href='#'>"+
           "      <img class='media-object' src='http://placehold.it/45x45'>"+
           "    </a>"+
           "    <div class='media-body', style='text-align: "+ leftRight +"'>"+
           "      <h4 class='media-heading'>"+ user +"</h4>"+
           "      "+ message +""+
           "    </div>"+
           "  </div>"
  }
  ///////////////////////////////////////////////////////////////////////////

  var pc = null;
  var localStream;
  var isStarted;
  var isInitiator;
  var isChannelReady;
  var pc_config = {
    'iceServers': 
      [
        {
          'url': 'stun:stun.l.google.com:19302'
        },
        {
          'url': 'turn:numb.viagenie.ca:3478',
          'credential': 'webrtcrails',
          'username': 'xescugil@gmail.com'
        }
      ]
    };
  var pc_constraints  = {optional: [{DtlsSrtpKeyAgreement: true}]}
  // var pc_config = 
  // {
  //   'iceServers': 
  //   [
  //     {
  //       'url': 'stun:stun.l.google.com:19302'
  //     },
  //     {
  //       'url': 'turn:192.158.29.39:3478?transport=udp',
  //       'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //       'username': '28224511:1379330808'
  //     },
  //     {
  //       'url': 'turn:192.158.29.39:3478?transport=tcp',
  //       'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //       'username': '28224511:1379330808'
  //     }
  //   ]
  // }
  var sdpConstraints = 
    {'mandatory': 
      {
        'OfferToReceiveAudio':true,
        'OfferToReceiveVideo':true 
      }
    };

  if (room !== "") {
    console.log('Joining room ' + room);
    socket.emit('create or join', room);
  }

  var localVideo  = document.querySelector('#localVideo');
  var remoteVideo = document.querySelector('#remoteVideo');

  var constraints = 
    {
      video: true,
      audio: true
    };


  // Logs getUserMedia KO
  function gotError(error){
    console.alert('Problems with GetUserMedia', error);
  }

  // Fetch the user Stream (Video and Audio), getUserMedia OK
  function gotStream(stream){
    localStream = stream;
    attachMediaStream(localVideo, stream);
    socket.emit('message', {message: 'gotStream', type: 'gotStream', room: room});
    if (isInitiator){
      maybeStart();
    }
  }

  // Get User Media
  getUserMedia(constraints, gotStream, gotError);

  // Stop the PeerConnection when the you leave the window
  function stop() {
    pc.close();
    pc = null;
    attachMediaStream(remoteVideo, null);
  }

  $("#js-hangup").on("click", function () {
    stop();
    socket.emit('message', {type: 'by', room: room});
  });

  window.onbeforeunload = function() {
    stop();
    socket.emit('message', {type: 'by', room: room});
  }

  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

  // Try to start, initiates the RTCPeerConnection
  function maybeStart() {
    if (isChannelReady && !isStarted && typeof localStream != 'undefined'){
      pc                = new RTCPeerConnection(pc_config, pc_constraints);
      // pc                = new RTCPeerConnection(pc_config);
      pc.onicecandidate = handleIceCandidate;
      pc.onaddstream    = handleOnAddRemoteStream;
      pc.onremovestream = handleOnRemoveStream;
      pc.addStream(localStream);
      isStarted         = true;
      if (isInitiator) {
        startCall();
      }
    }
  }

  // When recieving a ICE candidate sends it to the app, Trickle ICE. Without checking the gathering status if it's COMPLETE
  function handleIceCandidate(event) {
    console.log('ice', event);
    if (event.candidate) {
      socket.emit('message', {room: room, type: 'candidate', message: event.candidate});
    }
  }

  function handleOnAddRemoteStream(event){
    console.log("added Remote Stream")
    window.remoteVideoEvent = event;
    attachMediaStream(remoteVideo, event.stream);
  }

  function handleOnRemoveStream(event){
    console.log('Remote stream removed. Event: ', event);
  }

  function startCall(){
    console.log("Do Call");
    pc.createOffer(setLocalAndSendMessageOffer, handleCreateOfferError);
  }

  function startAnswer(){
    console.log("Do Call");
    pc.createAnswer(setLocalAndSendMessageAnswer, handleCreateAnswerError, sdpConstraints);
  }

  function handleCreateOfferError(event) {
    console.log("Error when Creating Offer", event);
  }

  function handleCreateAnswerError(event) {
    console.log("Error when Creating Answer", event);
  }

  function setLocalAndSendMessageOffer(offer) {
    offer.sdp = preferOpus(offer.sdp);
    pc.setLocalDescription(offer); 
    socket.emit('message', {room: room, type: 'offer', message: offer})
  }
  
  function setLocalAndSendMessageAnswer(answer) {
    answer.sdp = preferOpus(answer.sdp);
    pc.setLocalDescription(answer); 
    socket.emit('message', {room: room, type: 'answer', message: answer})
  }

  function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
      if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
        turnExists = true;
        turnReady = true;
        break;
      }
    }
    if (!turnExists) {
      console.log('Getting TURN server from ', turn_url);
      // No TURN server. Get one from computeengineondemand.appspot.com:
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
          var turnServer = JSON.parse(xhr.responseText);
          console.log('Got TURN server: ', turnServer);
          pc_config.iceServers.push({
            'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
            'credential': turnServer.password
          });
          turnReady = true;
        }
      };
      xhr.open('GET', turn_url, true);
      xhr.send();
    }
  }
  // Set Opus as the default audio codec if it's present.
  function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
          mLineIndex = i;
          break;
        }
    }
    if (mLineIndex === null) {
      return sdp;
    }
  
    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('opus/48000') !== -1) {
        var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
        if (opusPayload) {
          sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
        }
        break;
      }
    }
  
    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);
  
    sdp = sdpLines.join('\r\n');
    return sdp;
  }
  
  function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
  }
  // Set the selected codec to the first in m line.
  function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
      if (index === 3) { // Format of media starts from the fourth.
        newLine[index++] = payload; // Put target payload to the first.
      }
      if (elements[i] !== payload) {
        newLine[index++] = elements[i];
      }
    }
    return newLine.join(' ');
  }
  
  // Strip CN from sdp before CN constraints is ready.
  function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length-1; i >= 0; i--) {
      var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
      if (payload) {
        var cnPos = mLineElements.indexOf(payload);
        if (cnPos !== -1) {
          // Remove CN payload from m line.
          mLineElements.splice(cnPos, 1);
        }
        // Remove CN line in sdp
        sdpLines.splice(i, 1);
      }
    }
  
    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
  }
