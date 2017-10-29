/**
 * Example class takes the example messenger classes and prints all messages
 * to the console
 */
let MessengerManager = function MessengerManager() {
  this.messengers = [];
};

MessengerManager.prototype.addMessenger = function (messenger) {
  this.messengers.push(messenger);
};

MessengerManager.prototype.printAllMessages = function () {
  let i;
  for (i in this.messengers) {
    this.messengers[i].printMessage();
  }
};

module.exports = MessengerManager;