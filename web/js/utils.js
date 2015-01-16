
(function(global) {
    var MyUtils = function () {
        return{
            get: function (endpoint) {
                return new Promise(function(resolve, reject) {
                    // Do the usual XHR stuff
                    var req = new XMLHttpRequest();
                    req.open('GET', endpoint);

                    //req.withCredentials = true;

                    req.setRequestHeader('Authorization', 'Bearer 8c8390d5e6ba961bb21acb0466a689fb');

                    req.onload = function() {
                        // This is called even on 404 etc
                        // so check the status
                        if (req.status == 200) {
                            // Resolve the promise with the response text
                            resolve(req.response);
                        }
                        else {
                            // Otherwise reject with the status text
                            // which will hopefully be a meaningful error
                            reject(Error(req.statusText));
                        }
                    };

                    // Handle network errors
                    req.onerror = function() {
                        reject(Error("Network Error"));
                    };

                    // Make the request
                    req.send();
                });
            },

            // Function to get random number upto m
            // http://roshanbh.com.np/2008/09/get-random-number-range-two-numbers-javascript.html
            randomXToY: function (minVal,maxVal,floatVal) {
                var randVal = minVal+(Math.random()*(maxVal-minVal));
                return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
            }

        };
    }
    global.MyUtils = MyUtils();
})(window);
