
chrome.runtime.onInstalled.addListener( function () {
    console.log('XHR Hook Extension installed.');
});

const patchCodeBroken = `{ 
    function addXMLRequestCallback (callback) {
        if( XMLHttpRequest.callbacks ) {
            // we've already overridden send() so just add the callback
            XMLHttpRequest.callbacks.push( callback );
        } else {
            // create a callback queue
            XMLHttpRequest.callbacks = [callback];
            // store the native send()
            const oldSend = XMLHttpRequest.prototype.send;
            // override the native send()
            XMLHttpRequest.prototype.send = function () {
                // process the callback queue
                // the xhr instance is passed into each callback but seems pretty useless
                // you can't tell what its destination is or call abort() without an error
                // so only really good for logging that a request has happened
                // I could be wrong, I hope so...
                // EDIT: I suppose you could override the onreadystatechange handler though
                for( let i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
                    XMLHttpRequest.callbacks[i]( this );
                }
                // call the native send()
                oldSend.apply(this, arguments);
            }
        }
    }
    addXMLRequestCallback( function ( xhr ) {
        console.table( xhr );
    });
    console.log('patched!');
}`;

const patchCode2 = `
    // monkey patch
    const oldSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        const currentRequest = this;
        this.addEventListener("load", function (evt) { 
            // console.dir(currentRequest); 
            if( currentRequest.response instanceof String && currentRequest.response.includes('#EXTM3U') ) {
                console.log(currentRequest.response);
            } 
            else console.log(currentRequest.responseType, currentRequest.responseURL);  
        });
        oldSend.apply(this, arguments);
    }
    console.log('patched!');
`;

const patchCode3 = `
    // monkey patch
    const oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        console.log(arguments[1]);
        oldOpen.apply(this, arguments);
    }
    console.log('patched!');
`;

const inject = `{
    const dd208905_3bf6_429c_ac73_64f89ed22566 = document.createElement('script');
    dd208905_3bf6_429c_ac73_64f89ed22566.text = \`${patchCode2}\`;
    dd208905_3bf6_429c_ac73_64f89ed22566.onload = function () { this.remove(); };
    (document.head || document.documentElement).appendChild(dd208905_3bf6_429c_ac73_64f89ed22566);
}`;

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status==="loading") {
        chrome.tabs.executeScript(tabId, {code: inject, runAt: 'document_start'} );
    }
} );
