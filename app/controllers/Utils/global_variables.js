let MESSAGE_STATUSES = [
  {"status" : "pending"},
  {"status" : "sent"},
  {"status" : "delivered"},
  {"status" : "seen"}
];

let USER_STATUSES = [
    {
        name : "Online",
        color : "green"
    },
    {
        name : "Busy",
        color : 'red'
    },
    {
        name : "Away",
        color : "orange"
    },
    {
        name : "Offline",
        color : "black"
    }
]

module.exports = {
    MESSAGE_STATUSES : MESSAGE_STATUSES,
    USER_STATUSES : USER_STATUSES
};