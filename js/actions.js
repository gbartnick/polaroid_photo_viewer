(function(Reflux, global) {
    'use strict';

    global.NotesActions = Reflux.createActions([
        "addNote",
        "editNote",
        "deleteNote",
        "toggleFavoriteNote"
    ]);

    global.UsersActions = Reflux.createActions([
        "addUser",
        "editUser",
        "setCurrentUser"
    ]);

})(window.Reflux, window);