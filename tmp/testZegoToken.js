const { ZegoUIKitPrebuilt } = require('@zegocloud/zego-uikit-prebuilt');
const appID = 792719772;
const serverSecret = "128293b45cc7fd6e739367fb173ae810";
const roomID = "testRoom";
const userID = "testUser";
const userName = "Test";

const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);
console.log("KitToken:", kitToken);

// Decode the kitToken to see if it contains the real token
const decoded = Buffer.from(kitToken.split('.')[1] || kitToken, 'base64').toString('utf-8');
console.log("Decoded:", decoded);
