function log(e){
    var element;
    var maxLines = 10;


    
    if (!element) element = document.getElementById('log');

    var lines = [].slice.call(element.children).length;
    element.innerHTML += '<p>'+e+'</p>';
    element.scrollTop = element.scrollHeight;
    if (lines >= maxLines) element.removeChild(element.firstChild);
    //console.log(e);

};