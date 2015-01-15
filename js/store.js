(function(Reflux, AssetsActions, MyUtils, global) {
    'use strict';

    var noteCount = 0,
        userCount = 0,
        localNotesStorageKey = "notes",
        localUsersStorageKey = "users";

function getItemByKey(list, key){
    var item = undefined;
    list.forEach(function(itm){
        if(itm.key === key){
            item = itm;
        }
    });

    return item;
}

global.AssetsStore = Reflux.createStore({
    listenables: [AssetsActions],

    onEditNote: function(itemKey, newContent){
        var itm = getItemByKey(this.list, itemKey);
        if(!itm){
            return;
        }
        itm.text = newContent;
        this.updateList(this.list);
    },
    onAddNote: function(newContent){
        console.log(global.UsersStore.getCurrentUser());
        var currentUser = global.UsersStore.getCurrentUser()[0].name;
        noteCount++;
        var currentDate = new Date().toLocaleDateString();

        this.updateList([{
            key: noteCount,
            submittedDate: currentDate,
            submittedBy:currentUser,
            text: newContent
        }].concat(this.list));

    },

    onDeleteNote: function(key){
        var newList = this.list.filter(function(itm){
            return itm.key !== key;
        });
        this.updateList(newList);
    },

    updateList: function(list){
        localStorage.setItem(localNotesStorageKey, JSON.stringify(list));
        this.list = list;
        this.trigger(list);
    },

    getInitialState: function(){
        //get stuff from server
        var loadedList = localStorage.getItem(localNotesStorageKey);
        if(!loadedList){
            this.list = [];
            MyUtils.get('/api/note/list').then(function(resp){
                var notes = JSON.parse(resp);
                noteCount = notes.length;
                global.AssetsStore.updateList(notes);
            }, function(error){
                console.error("Failure", error);
            })
        }
        else{
            this.list = JSON.parse(loadedList);
            noteCount = this.list.length;
        }
        return this.list;
    }
});

global.UsersStore = Reflux.createStore({
    listenables: [UsersActions],

    onEditUser: function(itemKey, userName){
        var itm = getItemByKey(this.list, itemKey);
        if(!itm){
            return;
        }
        itm.text = newContent;
        this.updateList(this.list);
    },

    onAddUser: function(newUser){

        userCount++;

        this.updateList([{
            key: userCount,
            name: newUser,
            selected:false
        }].concat(this.list));
    },
    updateList: function(list){
        localStorage.setItem(localUsersStorageKey, JSON.stringify(list));
        this.list = list;
        this.trigger(list);
    },
    getCurrentUser:function(){
        return this.list.filter(function(usr){
            return usr.selected === true;
        });
    },
    onSetCurrentUser:function(key){
        this.list.forEach(function(usr){
            if(usr.key == key){
                usr.selected = true;
            }
            else{
                usr.selected = false;
            }
        });
    },
    getInitialState: function(){
        //get stuff from server
        var loadedList = localStorage.getItem(localUsersStorageKey);
        if(!loadedList){
            this.list = [];

            MyUtils.get('/api/user/list').then(function(resp){
                var users = JSON.parse(resp);
                userCount = users.length;
                global.UsersStore.updateList(users);

            }, function(error){
                console.error("Failure", error);
            })
        }
        else{
            this.list = JSON.parse(loadedList);
            userCount = this.list.length;
        }

        return this.list;
    }

});

})(window.Reflux, window.NotesActions, window.MyUtils, window);

