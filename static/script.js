var posts = [
	'rust-messagebox',
	'lua-in-15m',
	'optimize-lua-compiler'
];

var labelTemp =
`<div class='post'>
	<a href='$0'>$1</a>
	<label>$2</label>
	<p>$3</p>
</div>`;

var postTemp =
`<h1 class="title">$0</h1>
<div class="date">$1</div>
<div class="line">─── // ───</div>	
<div class="content">$2</div>`;

window.onload = function()
{
	if (getCookie('darkmode') == 'true')
	{
		document.body.classList = 'dark';
	}
	
	var list = document.getElementById('posts');
	var lp = window.location.pathname;
	
	var scrollup = document.getElementById('scrollup');
	
	scrollup.onclick = function()
	{
		scrollToTop(350);
	};
	
	window.onscroll = function(e)
	{
		if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100)
		{
			scrollup.style.visibility = 'visible';
		}
		else
		{
			scrollup.style.visibility = 'hidden';
		}
	};
	
	document.getElementById('logo').onclick = function()
	{
		var cls = document.body.classList;
		if (cls == 'dark')
		{
			document.body.classList = '';
			document.cookie = 'darkmode=false;path=/'
		}
		else
		{
			document.body.classList = 'dark';
			document.cookie = 'darkmode=true;path=/'
		}
	}
	
	if (lp == '/' || lp == '/index.html')
	{
		for (var i = posts.length - 1;i >= 0;--i)
		{
			var content, html = '';			
			content = readFile('/posts/' + posts[i] + '/index.html');
            content = getContent(content).split('-+-+-').shift();
			
			html = labelTemp
				.replace('$0', '/posts/' + posts[i])
				.replace('$1', parse(content, 'title'))
				.replace('$2', parse(content, 'date'))
				.replace('$3', parse(content, 'descript'))
			
			list.innerHTML += html;
		}
	}
	else if (lp.indexOf('/posts/') > -1)
	{
		showdown.extension('codehighlight', function() {
            function htmlunencode(text) {
                return text.replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
            }
            return [{
                type: 'output',
                filter: function (text, converter, options) {
                    var left  = '<pre><code\\b[^>]*>',
                        right = '</code></pre>',
                        flags = 'g',
                        replacement = function (wholeMatch, match, left, right) {
                            match = htmlunencode(match);
                            return left + hljs.highlightAuto(match).value + right;
                        };
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
                }
            }];
        });
		
		showdown.setFlavor('github');
		var converter = new showdown.Converter({ openLinksInNewWindow: true, extensions: ['codehighlight']});
		var contents = readFile((window.location.href).replace('/index.html', '') + '/index.html');
        contents = getContent(contents).split('-+-+-');
		
		var html = postTemp
			.replace('$0', parse(contents[0], 'title'))
			.replace('$1', parse(contents[0], 'date'))
			.replace('$2', converter.makeHtml(contents[1]));
		
		document.getElementById('post').innerHTML = html;		
	}
	
	document.getElementsByTagName('footer')[0].innerHTML = '© ' + (new Date).getFullYear() + ' wuuyi';
};

function parse(str, key)
{
    return str.split(key + ':').pop().split(';').shift();
}

function getContent(str)
{
    return str.split('<!--content>').pop().split('</content-->').shift();
}

function readFile(file)
{
	var allText = '', rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4)
            if (rawFile.status === 200 || rawFile.status == 0)
                allText = rawFile.responseText;
	}
   	rawFile.send(null);
    return allText;
}

function scrollToTop(scrollDuration)
{
    var scrollStep = -window.scrollY / (scrollDuration / 15),
        scrollInterval = setInterval(function(){
        if ( window.scrollY != 0 ) {
            window.scrollBy( 0, scrollStep );
        }
        else clearInterval(scrollInterval); 
    }, 15);
}

function getCookie(cname)
{
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
	    while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
