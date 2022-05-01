const express = require('express');
const router = express.Router();
// Imports all the controllers within the users.js controller file
const { getCreated, getBookmarked, getBookmarkedShortcut, getCreatedShortcut, getUser, putUser, deleteUser, getRecent } = require("../controllers/users");

// Completes the endpoint established in server.js and specifies the controller and the API request type
router.route("/recent").get(getRecent)
router.route("/bookmarked").get(getBookmarked);
router.route("/created").get(getCreated);
router.route("/bookmarked-shortcut").get(getBookmarkedShortcut);
router.route("/created-shortcut").get(getCreatedShortcut);
router.route("/").get(getUser).put(putUser).delete(deleteUser);

module.exports = router