//import 'babel-polyfill';
//import Parser from './parser';
//import { log } from './log.js';


function handleKeyDownEvents () {
    try{
	    if(tizen.tvinputdevice){
            log('supports tizen');
            var usedKeys = [
                        'Info',
                        'MediaPause', 'MediaPlay',
                        'MediaPlayPause', 'MediaStop',
                        'MediaFastForward', 'MediaRewind',
                        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
                        ];

	         // Register keys
	         usedKeys.forEach(function(key) {
	           tizen.tvinputdevice.registerKey(key);
	         });

	         // Key events
	         document.addEventListener('keydown', function(e) {
	            var key = e.keyCode;
	            switch (key) {
	                case 37: // Left
	              	    log(key);
	              	    Obj.prev();
	              	break;
	                case 38: // Up
	              	    log(key);
		                Obj.lineUp();
		            break;
	                case 39: // Right
	              	    log(key);
		                Obj.next();
		            break;
	                case 40: // Down
	              	    log(key);
		                Obj.lineDown();
		            break;
	                case 48: // Down
	              	    log(key);
	              	    document.getElementById('log').classList.toggle('hide');
		            break;
	                default:
	              	    log('key:', key);
	                break;
	            }
	        });
        }
    }
    catch(e){
        log(e);
        log('does not support tizen');
		// add eventListener for keydown
	    document.addEventListener('keydown', function(e) {
	    	    	
	    	switch(e.key){
	    	case 'Left': //LEFT arrow
			case 'ArrowLeft':
	        	log("Left");
	            Obj.prev();
	    		break;
	    	case 'Up': //UP arrow
			case 'ArrowUp':
	    		log("UP");
	            Obj.lineUp();
	    		break;
	    	case 'Right': //RIGHT arrow
			case 'ArrowRight':
	    		log("RIGHT");
	            Obj.next();
	    		break;
	    	case 'Down': //DOWN arrow
			case 'ArrowDown':
	    		log("DOWN");
	            Obj.lineDown();
	    		break;
	    	case 'Enter': //OK button
	    		log("ENTER");
	    		break;
	    	case 'Backspace': //RETURN button
	    		log("BACKSPACE");
	    		break;
	    	case 'p': // PLAYPAUSE button
	    		log("PLAYPAUSE");
	    		break;
	        case 'a': // PLAYPAUSE button
	    		log("a");
	            log(Obj.channelSelected);
	    		break;
	        case '0': // PLAYPAUSE button
	    		log("0");
	            document.getElementById('log').classList.toggle('hide');
	    		break;
	    	default:
	    		log("Key code : " + e.key);
	    		break;
	    	}
	    });
    }	
};


var Obj = (function() {
    var channelList;
    var menuList;
    var channelSelected;
    var numChannelItems;
    var menuSelected;
    var numMenuItems;
    var cursor;
    var downloadNextValue;
    var downloadValue;
    var percentage = 0;
    var channelsParsed;

    setInterval(function (){
        var num =0;
        num += 1;
        log('num '+num);
    },2000);

    return{
        init: function(){
            menuList = document.querySelector('.menu');
            try {
            	var xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://fiqueemcasa.club:80/get.php?username=raptvlv&password=120475&type=m3u_plus&output=m3u8', true);
                xhr.onreadystatechange = function() {
//                	log('state: ' + xhr.readyState + ' | status: ' + xhr.status);
                    if(this.readyState == this.HEADERS_RECEIVED){
                        log('HEADER size: ' + xhr.getResponseHeader('Content-Length'));
                        log('IP: ' + xhr.getResponseHeader('X-Edge-IP'));
                    }
                    if (xhr.readyState == 4) {
                    if (xhr.status == 0 || xhr.status == 200) {
                    	log('start parsing');
                        channelsParsed = Parser.parse(xhr.responseText);
                        log('parsing complete');
                        // var nodes = [].slice.call(menuList.children);
                        for (var key in channelsParsed.items) {
                            var div = document.createElement('div');
                            var p = document.createElement('p');
                            div.className = 'channelGroup';
                            p.innerHTML = channelsParsed.items[key].name;
                            div.appendChild(p);
                            menuList.appendChild(div);
                            }
                        log('element added complete');
                        }
                    } else {
//                        log('Error loading playlist:', xhr.status);
                    }
                };
                xhr.onerror = function (e){
                	log('error - '+ e  + ' status '+ xhr.status + ' state '+ xhr.readyState);
                    if(downloadValue > 70){
                        Connection.generateList(xhr.responseText);
                    }else{
                        log('DEU RUIM MESMO, chegou so: '+percentage);
                    }
                };
                xhr.onprogress = function (e){
                	downloadNextValue = parseInt(e.loaded / e.total * 100);
                    if(downloadNextValue != downloadValue){
                        log(downloadNextValue + '%'  + ' status '+ xhr.status + ' | '+ e.loaded+' bytes | state '+ xhr.readyState);
                    }
                    downloadValue = downloadNextValue;
                };
                log('starting request');
                xhr.send(null);
                log('sending request');
			} catch (e) {
				log(e);
			}
            
            var moviesWidth = document.querySelector('.movies').clientWidth;
            var screenWidth = window.screen.width;
            var cardWidth = document.querySelector('.card').offsetLeft;
            var ratio = (moviesWidth/screenWidth);
            log('window width: '+ screenWidth);
            log('movies width: '+ moviesWidth);
            log('ratio: '+ ratio);
            log('card width: ' + cardWidth);
            numChannelItems = (screenWidth*ratio) / cardWidth;
            numChannelItems = Math.round(numChannelItems);
            log('# cards: ' + numChannelItems);
            channelList = document.querySelector('.movies');
            if(!channelSelected) channelSelected = channelList.firstElementChild;
            channelSelected.className += " channelSelected";
            menuList = document.querySelector('.menu');
            if(!menuSelected) menuSelected = menuList.firstElementChild;
            menuSelected.className += " menuSelected";
            cursor = 'Channel';
            
        },
        next: function(){
            if(cursor === 'Menu'){
                cursor = 'Channel';
                menuSelected.className = "channelGroup menuSelected";
                channelSelected = channelList.firstElementChild;
                channelSelected.className += " channelSelected";
                return;
            }
            if(!channelSelected) {
                channelSelected = channelList.firstElementChild;
            }else{
                channelSelected.className = "card";
                channelSelected = channelSelected.nextElementSibling;
            }
            if(!channelSelected) channelSelected = channelList.firstElementChild;
            channelSelected.className += " channelSelected";
        },
        prev: function(){
            if(cursor === 'Menu') return;
            var nodes = [].slice.call(channelList.children);
            var pos = nodes.indexOf(channelSelected);
            if(!(pos%numChannelItems)){
                channelSelected.className = "card";
                cursor = 'Menu';
                this.selectMenu();
                return;
            }

            if(!channelSelected) {
                channelSelected = channelList.firstElementChild;
            }else{
                channelSelected.className = "card";
                channelSelected = channelSelected.previousElementSibling;
            }
            if(!channelSelected) channelSelected = channelList.lastElementChild;
            channelSelected.className += " channelSelected";
        },
        lineUp: function(){
            if(cursor === 'Menu'){
                var nodes = [].slice.call(menuList.children);
                if(!menuSelected) {
                    menuSelected = menuList.firstElementChild;
                }else{
                    menuSelected.className = "channelGroup";
                    menuSelected = menuSelected.previousElementSibling;
                }
                if(!menuSelected) menuSelected = menuList.lastElementChild;
                menuSelected.className += " menuSelectedMoving";
            }else{
                var nodes = [].slice.call(channelList.children);
                if(!channelSelected) {
                    channelSelected = channelList.firstElementChild;
                }else{
                    channelSelected.className = "card";
                    channelSelected = channelList.children[nodes.indexOf(channelSelected)-numChannelItems];
                }
                if(!channelSelected) channelSelected = channelList.lastElementChild;
                channelSelected.className += " channelSelected";
            }
            
        },
        lineDown: function(){
            if(cursor === 'Menu'){
                var nodes = [].slice.call(menuList.children);
                if(!menuSelected) {
                    menuSelected = menuList.firstElementChild;
                }else{
                    menuSelected.className = "channelGroup";
                    menuSelected = menuSelected.nextElementSibling;
                }
                if(!menuSelected) menuSelected = menuList.firstElementChild;
                menuSelected.className += " menuSelectedMoving";
                menuList.scrollTop = 1;
            }else{
                var nodes = [].slice.call(channelList.children);
                if(!channelSelected) {
                    channelSelected = channelList.firstElementChild;
                }else{
                    channelSelected.className = "card";
                    channelSelected = channelList.children[nodes.indexOf(channelSelected)+numChannelItems];
                }
                if(!channelSelected) channelSelected = channelList.firstElementChild;
                channelSelected.className += " channelSelected";
            }
        },
        selectMenu: function(){
            if(!menuSelected) {
                menuSelected = menuList.firstElementChild;
            }
            menuSelected.className = "channelGroup menuSelectedMoving";
        }
    };


}());



function listadiretorio(){
    try {
        function onResolveSuccess(dir) { 
            dir.listFiles(onsuccess);
        }
        function onsuccess(files) {
            for (var i = 0; i < files.length; i++) {
                /* Display the file name and URI */
                log('File name is ' + files[i].name + ', URI is ' + files[i].toURI());
            }
            deletafile();
        }
        tizen.filesystem.resolve('documents', onResolveSuccess, null, 'r');
    } catch (error) {
        log(error);
    }
}

function criafile(){
    try {
        var documentsDir, newFile;
        tizen.filesystem.resolve('documents', function(result) {
        documentsDir = result;
        newFile = documentsDir.createFile('listam3u.txt');
        });
    } catch (error) {
        log(error);
    }
}

//to delete needs full path
function deletafile(){
    try {
        var documentsDir;
        function onDelete() {
            log('deletedFile() is successfully done.');
        }

        tizen.filesystem.resolve('documents', function(result) {
            documentsDir = result;
            documentsDir.deleteFile('file:///opt/usr/media/Documents/listam3u.txt', onDelete);
            });
        
        
        
    } catch (error) {
        log(error);
    }
}



window.onload = function(){

    //listadiretorio();
    //deletafile();
    handleKeyDownEvents();
    Obj.init();
    
};