window.onload = () => {
  cast.receiver.logger.setLevelValue(0);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  // handler for the 'ready' event
  castReceiverManager.onReady = (event) => {
    console.log(`Received Ready event: ${JSON.stringify(event.data)}`);
    window.castReceiverManager.setApplicationState('Application status is ready...');
  };

  // handler for 'senderconnected' event
  castReceiverManager.onSenderConnected = (event) => {
    console.log(`Received Sender Connected event: ${event.data}`);
    console.log(window.castReceiverManager.getSender(event.data).userAgent);
  };

  // handler for 'senderdisconnected' event
  castReceiverManager.onSenderDisconnected = (event) => {
    console.log(`Received Sender Disconnected event: ${event.data}`);
    if (window.castReceiverManager.getSenders().length === 0) {
      window.close();
    }
  };

  // handler for 'systemvolumechanged' event
  castReceiverManager.onSystemVolumeChanged = (event) => {
    console.log(`Received System Volume Changed event: ${event.data.level} ${
      event.data.muted}`);
  };

  // create a CastMessageBus to handle messages for a custom namespace
  window.messageBus =
    window.castReceiverManager.getCastMessageBus('urn:x-cast:com.khalis.cast.sttm.gurbani', cast.receiver.CastMessageBus.MessageType.JSON);

  // handler for the CastMessageBus message event
  window.messageBus.onMessage = (event) => {
    console.log(`Message [${event.senderId}]: ${event.data}`);
    // display the message from the sender
    displayText(event.data);
    // inform all senders on the CastMessageBus of the incoming message event
    // sender message listener will be invoked
    window.messageBus.send(event.senderId, event.data);
  };

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start({statusText: 'Application is starting'});
  console.log('Receiver Manager started');
};

// utility function to display the text message in the input field
function displayText(json) {
  console.log(json);
  const gurbani = JSON.parse(json);
  const {prefs} = gurbani;
  const showNextLine = prefs['slide-layout'].fields['display-next-line'] === true;
  const showTeeka = prefs['slide-layout'].fields['display-teeka'] === true;
  const showTranslation = prefs['slide-layout'].fields['display-translation'] === true;
  const showtransliteration = prefs['slide-layout'].fields['display-transliteration'] === true;
  const gurmukhiElement = document.getElementById('gurmukhi');
  const larivaarElement = document.getElementById('larivaar');
  const translationElement = document.getElementById('translation');
  const teekaElement = document.getElementById('teeka');
  const transliterationElement = document.getElementById('transliteration');
  const nextLineElement = document.getElementById('next-line');

  clearClasses();
  document.body.classList.add(`${prefs.app.theme}`);

  if (!gurbani.showInEnglish) {
    gurmukhiElement.classList.add('gurmukhi', 'gurbani');
    larivaarElement.classList.add('gurmukhi', 'gurbani');
  } else {
    gurmukhiElement.classList.remove('gurmukhi', 'gurbani');
    larivaarElement.classList.remove('gurmukhi', 'gurbani');
  }

  if (showTranslation) document.body.classList.add('display-translation');
  if (showTeeka) document.body.classList.add('display-teeka');
  if (showtransliteration) document.body.classList.add('display-transliteration');
  if (showNextLine) document.body.classList.add('display-next-line');

  document.body.classList.add(`gurbani-${prefs['slide-layout']['font-sizes'].gurbani}`);
  document.body.classList.add(`translation-${prefs['slide-layout']['font-sizes'].translation}`);
  document.body.classList.add(`teeka-${prefs['slide-layout']['font-sizes'].teeka}`);
  document.body.classList.add(`transliteration-${prefs['slide-layout']['font-sizes'].transliteration}`);
  document.body.classList.add(`next-line-${prefs['slide-layout']['font-sizes'].gurbani}`);

  if (prefs['slide-layout']['display-options'].larivaar === true) {
    document.body.classList.add('larivaar');
    gurmukhiElement.style.display = 'none';
    larivaarElement.style.display = 'block';
  } else {
    gurmukhiElement.style.display = 'block';
    larivaarElement.style.display = 'none';
  }
  if (prefs['slide-layout']['display-options']['left-align'] === true) document.body.classList.add('left-align');

  gurmukhiElement.innerText = gurbani.gurmukhi ? gurbani.gurmukhi : '';
  larivaarElement.innerHTML = gurbani.larivaar ? `<span class="larivaar">${gurbani.larivaar}</span>` : '';

  translationElement.innerText = gurbani.translation && showTranslation ? gurbani.translation : '';
  teekaElement.innerText = gurbani.teeka && showTeeka ? gurbani.teeka : '';
  transliterationElement.innerText = gurbani.transliteration && showtransliteration ? gurbani.transliteration : '';
  nextLineElement.innerText = gurbani.nextLine && showNextLine ? gurbani.nextLine : '';

  window.castReceiverManager.setApplicationState(json);
}

function clearClasses() {
  document.body.className = '';
}
