(function(Reflux, global) {
    'use strict';

    global.AssetsActions = Reflux.createActions([
        "search",
        "deleteAsset",
        "toggleFavoriteAsset",
        "shuffle"
    ]);

})(window.Reflux, window);