const patch_XMLHttpRequest_send = `
    // monkey patch XMLHttpRequest.send()
    const oldSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        const currentRequest = this;
        this.addEventListener("load", function (evt) { 
            //console.log( { type: currentRequest.responseType, URL: currentRequest.responseURL, response: currentRequest.response } );
            const splitAt = currentRequest.responseURL.indexOf('?');
            const address = currentRequest.responseURL.substring( 0, splitAt );
            const queryString = currentRequest.responseURL.substring( splitAt + 1 );
            const urlParams = new URLSearchParams(queryString);
            if ( address.includes('/videoplayback') ) 
            {
                console.table("********"+address);
                for (const [key, value] of urlParams) {
                    console.log(key, value);
                }
                console.log(currentRequest.response.byteLength);
            }
        });
        oldSend.apply(this, arguments);
    }
    console.log('XMLHttpRequest.send() patched!');
`;

const patch_XMLHttpRequest_open = `
    // monkey patch XMLHttpRequest.open()
    const oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        console.log(arguments[1]);
        oldOpen.apply(this, arguments);
    }
    console.log('XMLHttpRequest.open() patched!');
`;

/*
if( currentRequest.responseType == "" && 
    currentRequest.response instanceof String && 
    currentRequest.response.includes('#EXTM3U') ) 
{
    console.log(currentRequest.response);
}

*/