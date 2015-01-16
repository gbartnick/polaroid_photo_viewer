(function(Reflux, AssetsActions, MyUtils, global) {
    'use strict';

    var assetCount = 0,
        localAssetsStorageKey = "assets";

function getItemByUuid(list, uuid){
    var item = undefined;
    list.forEach(function(itm){
        if(itm.uuid === uuid){
            item = itm;
        }
    });

    return item;
}

global.AssetsStore = Reflux.createStore({
    listenables: [AssetsActions],

    onSearch: function(query){
        console.log("Searching");

        MyUtils.get('/api/rest/asset/search/'+query).then(function(resp){
            var data = JSON.parse(resp);
            var assets = data.assets;
            assetCount = assets.length;
            global.AssetsStore.updateList(assets);
        }, function(error){
            console.error("Failure", error);
        })
    },

    onDeleteAsset: function(uuid){
        var newList = this.list.filter(function(itm){
            return itm.uuid !== uuid;
        });
        this.updateList(newList);
    },

    updateList: function(list){
        // localStorage.setItem(localAssetsStorageKey, JSON.stringify(list));
        this.list = list;
        this.trigger(list);
    },

    getInitialState: function(){
        //get stuff from server
        var loadedList;// = localStorage.getItem(localAssetsStorageKey);
        if(!loadedList){
            this.list = [];
            // MyUtils.get('/api/asset/search').then(function(resp){
            if (true) {
                MyUtils.get('/api/rest/asset/search/fn:(kitten or puppies)').then(function(resp){
                    var data = JSON.parse(resp);
                    var assets = data.assets;
                    assetCount = assets.length;
                    global.AssetsStore.updateList(assets);
                }, function(error){
                    console.error("Failure", error);
                })
            }
        }
        else{
            this.list = JSON.parse(loadedList);
            assetCount = this.list.length;
        }
        return this.list;
    }
});

})(window.Reflux, window.AssetsActions, window.MyUtils, window);

