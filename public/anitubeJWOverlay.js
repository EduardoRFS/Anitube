var isAdLoaded = false;
var loader = 0;
var perLoad = 0;
var loadingSpeed = 10;
var loaderTime = 0;
var banners = [];
function AnitubeJWOverlay(jwPlayer, targetId) {
	this.jwPlayer = jwPlayer;
	this.target = document.getElementById(targetId);
	this.bannerStarted = false;
	
	if (!this.target) {
		this.ready = false;
		return false;
	}
	this.ready = true;

	createBoxOverlay = createBoxOverlay;
}

AnitubeJWOverlay.prototype.setOverlayBox = function(timer, overlayBoxContent) {
	if (!this.ready) return false;

	loaderTime = timer;

	createBoxOverlay(this.target, overlayBoxContent);
	startBoxOverlay(this.jwPlayer);
}
function createBoxOverlay(target, boxOverlayContent) {
	var linkCloseBox = "<a id='linkCloseBox' href='javascript:void(0)'></a>";
	var boxOverlayLoader = "<div id='overlayBoxLoader'><div id='overlayLoader'></div></div>";
	var boxOverlay = "<div id='anitubeBoxOverlay'>"+ linkCloseBox + boxOverlayContent + boxOverlayLoader +"</div>";
	target.insertAdjacentHTML('beforeend', boxOverlay);
}
function startBoxOverlay(jwPlayer) {
	jwPlayer.setControls(false);
	jwPlayer.pause(true);

	setAnitubeJWOverlayEvents(jwPlayer);
	loadAnitubeJWOverlay(jwPlayer);
}
function setAnitubeJWOverlayEvents(jwPlayer) {
	document.getElementById('linkCloseBox').onclick = function() {
		jwPlayer.play(true);
	}
	jwPlayer.onPlay(function() {
		if (!isAdLoaded) {
			jwPlayer.pause(true);
		} else {
			document.getElementById('overlayBoxLoader').style.display = 'none';
			document.getElementById('anitubeBoxOverlay').style.display = 'none';
			document.getElementById('linkCloseBox').style.display = 'block';
		}
	});

	jwPlayer.onPause(function() {
		document.getElementById('anitubeBoxOverlay').style.display = 'block';
	});
}
function loadAnitubeJWOverlay(jwPlayer) {
	document.getElementById('anitubeBoxOverlay').style.display = 'block';
	document.getElementById('overlayBoxLoader').style.display = 'block';
	perLoad = 100 / (loaderTime * (1000 / loadingSpeed));
	var loaderAnimation = setInterval(function() {
		if (loader >= 100) {
			isAdLoaded = true;
			jwPlayer.play(true);
			clearInterval(loaderAnimation);
		}
		loader += perLoad;
		loader = loader >= 100 ? 100 : loader;
		document.getElementById('overlayLoader').style.width = loader + '%';
	}, loadingSpeed);
}

AnitubeJWOverlay.prototype.addBannerOverlay = function(time, overlayBannerContent) {
	if (!this.ready) return false;

	var banner = {
		time: time,
		content: overlayBannerContent,
		showed: false
	};
	banners.push(banner);

	if (!this.bannerStarted) {
		createBannerOverlay(this.target);
		addBannerEvent(this.jwPlayer);
		this.bannerStarted = true;
	}
}

function createBannerOverlay(target) {
	var linkCloseBanner = "<a id='linkCloseBanner' href='javascript:void(0)'></a>";
	var bannerOverlay = "<div id='anitubeBannerOverlay'>"+ linkCloseBanner +"<div id='bannerContent'></div></div>";
	target.insertAdjacentHTML('beforeend', bannerOverlay);
}

function addBannerEvent(jwPlayer) {
	var linkCloseBanner = document.getElementById('linkCloseBanner');
	var bannerTarget = document.getElementById('anitubeBannerOverlay');
	var bannerContentTarget = document.getElementById('bannerContent');

	linkCloseBanner.onclick = function() {
		bannerTarget.style.display = 'none';
	}
	jwPlayer.onTime(function (time) {
		for(i in banners) {
			var banner = banners[i];
	    	if (time.position >= banner.time && !banner.showed) {
	    		bannerContentTarget.innerHTML = banner.content;
	    		bannerTarget.style.display = 'block';
	    		banner.showed = true;
	    	}
		}
	});
}