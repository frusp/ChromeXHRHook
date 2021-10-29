
chrome.runtime.onInstalled.addListener( function () {
    console.log('XHR Hook Extension installed.');
});

function injectScript (patchCode) {
    const UID = 'dd208905_3bf6_429c_ac73_64f89ed22566';
    return `{
        const ${UID} = document.createElement('script');
        ${UID}.text = \`${patchCode}\`;
        ${UID}.onload = function () { this.remove(); };
        (document.head || document.documentElement).appendChild(${UID});
    }`;
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status==="loading") {
        // TODO: verify that "loading" event fires exactly once per page opened
        chrome.tabs.executeScript(tabId, {code: injectScript(patch_XMLHttpRequest_send), runAt: 'document_start'} );
    }
} );
