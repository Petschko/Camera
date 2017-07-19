// Camera slideshow v1.4.0 - a jQuery slideshow with many effects, transitions, easy to customize, using canvas and mobile ready, based on jQuery 1.9.1+
// Copyright (c) 2012 by Manuel Masia - www.pixedelic.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
;(function ($) {
	/**
	 *
	 * @param opts
	 */
	$.fn.camera = function (opts) {

		var defaults = {
			alignment: 'center', //topLeft, topCenter, topRight, centerLeft, center, centerRight, bottomLeft, bottomCenter, bottomRight

			autoAdvance: true,	//true, false

			mobileAutoAdvance: true, //true, false. Auto-advancing for mobile devices

			barDirection: 'leftToRight',	//'leftToRight', 'rightToLeft', 'topToBottom', 'bottomToTop'

			barPosition: 'bottom',	//'bottom', 'left', 'top', 'right'

			cols: 6,

			easing: 'easeInOutExpo',	//for the complete list http://jqueryui.com/demos/effect/easing.html

			mobileEasing: '',	//leave empty if you want to display the same easing on mobile devices and on desktop etc.

			fx: 'random',	//'random','simpleFade', 'curtainTopLeft', 'curtainTopRight', 'curtainBottomLeft', 'curtainBottomRight', 'curtainSliceLeft', 'curtainSliceRight', 'blindCurtainTopLeft', 'blindCurtainTopRight', 'blindCurtainBottomLeft', 'blindCurtainBottomRight', 'blindCurtainSliceBottom', 'blindCurtainSliceTop', 'stampede', 'mosaic', 'mosaicReverse', 'mosaicRandom', 'mosaicSpiral', 'mosaicSpiralReverse', 'topLeftBottomRight', 'bottomRightTopLeft', 'bottomLeftTopRight', 'bottomLeftTopRight'
			//you can also use more than one effect, just separate them with commas: 'simpleFade, scrollRight, scrollBottom'

			mobileFx: '',	//leave empty if you want to display the same effect on mobile devices and on desktop etc.

			gridDifference: 250,	//to make the grid blocks slower than the slices, this value must be smaller than transPeriod

			height: '50%',	//here you can type pixels (for instance '300px'), a percentage (relative to the width of the slideshow, for instance '50%') or 'auto'

			imagePath: 'images/',	//he path to the image folder (it serves for the blank.gif, when you want to display videos)

			hover: true,	//true, false. Puase on state hover. Not available for mobile devices

			loader: 'pie',	//pie, bar, none (even if you choose "pie", old browsers like IE8- can't display it... they will display always a loading bar)

			loaderColor: '#eeeeee',

			loaderBgColor: '#222222',

			loaderOpacity: .8,	//0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1

			loaderPadding: 2,	//how many empty pixels you want to display between the loader and its background

			loaderStroke: 7,	//the thickness both of the pie loader and of the bar loader. Remember: for the pie, the loader thickness must be less than a half of the pie diameter

			minHeight: '200px',	//you can also leave it blank

			navigation: true,	//true or false, to display or not the navigation buttons

			navigationHover: true,	//if true the navigation button (prev, next and play/stop buttons) will be visible on hover state only, if false they will be visible always

			mobileNavHover: true,	//same as above, but only for mobile devices

			opacityOnGrid: false,	//true, false. Decide to apply a fade effect to blocks and slices: if your slide show is full-screen or simply big, I recommend to set it false to have a smoother effect

			overlayer: true,	//a layer on the images to prevent the users grab them simply by clicking the right button of their mouse (.camera_overlayer)

			pagination: true,

			playPause: true,	//true or false, to display or not the play/pause buttons

			pauseOnClick: true,	//true, false. It stops the slide show when you click the sliders.

			pieDiameter: 38,

			piePosition: 'rightTop',	//'rightTop', 'leftTop', 'leftBottom', 'rightBottom'

			portrait: false, //true, false. Select true if you don't want that your images are cropped

			rows: 4,

			slicedCols: 12,	//if 0 the same value of cols

			slicedRows: 8,	//if 0 the same value of rows

			slideOn: 'random',	//next, prev, random: decide if the transition effect will be applied to the current (prev) or the next slide

			thumbnails: false,

			time: 7000,	// milliseconds between the end of the sliding effect and the start of the nex one

			transPeriod: 1500,	// length of the sliding effect in milliseconds

			// ============== Callbacks =================

			/**
			 * this callback is invoked when the transition effect ends
			 */
			onEndTransition: function () {},

			/**
			 * this callback is invoked when the image on a slide has completely loaded
			 */
			onLoaded: function () {},

			/**
			 * this callback is invoked when the image on a slide start loading
			 */
			onStartLoading: function () {},

			/**
			 * this callback is invoked when the transition effect starts
			 */
			onStartTransition: function () {}

		};

		/**
		 *
		 * @returns {boolean}
		 */
		function isMobile() {
			return !! (
				navigator.userAgent.match(/Android/i) ||
				navigator.userAgent.match(/webOS/i) ||
				navigator.userAgent.match(/iPad/i) ||
				navigator.userAgent.match(/iPhone/i) ||
				navigator.userAgent.match(/iPod/i)
			);
		}

		$.support.borderRadius = false;
		$.each(['borderRadius', 'BorderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'OBorderRadius', 'KhtmlBorderRadius'], function () {
			if (document.body.style[this] !== undefined)
				$.support.borderRadius = true;
		});

		opts = $.extend({}, defaults, opts);

		var wrap = $(this).addClass('camera_wrap');

		wrap.wrapInner(
			'<div class="camera_src"></div>'
		).wrapInner(
			'<div class="camera_fakehover"></div>'
		);

		var fakeHover = $('.camera_fakehover', wrap);
		var fakeHoverSelector = $('.camera_fakehover', wrap);

		fakeHover.append('<div class="camera_target"></div>');

		if (opts.overlayer === true)
			fakeHover.append('<div class="camera_overlayer"></div>');

		fakeHover.append('<div class="camera_target_content"></div>');

		var loader;
		if (opts.loader === 'pie' && ! $.support.borderRadius)
			loader = 'bar';
		else
			loader = opts.loader;

		if (loader === 'pie')
			fakeHover.append('<div class="camera_pie"></div>');
		else if (loader === 'bar')
			fakeHover.append('<div class="camera_bar"></div>');
		else
			fakeHover.append('<div class="camera_bar" style="display: none;"></div>');

		if (opts.playPause === true)
			fakeHover.append('<div class="camera_commands"></div>');

		if (opts.navigation === true) {
			fakeHover.append(
				'<div class="camera_prev"><span></span></div>'
			).append(
				'<div class="camera_next"><span></span></div>'
			);
		}

		if (opts.thumbnails === true)
			wrap.append('<div class="camera_thumbs_cont"></div>');

		if (opts.thumbnails === true && opts.pagination !== true) {
			$('.camera_thumbs_cont', wrap).wrap(
				'<div></div>'
			).wrap(
				'<div class="camera_thumbs"></div>'
			).wrap(
				'<div></div>'
			).wrap(
				'<div class="camera_command_wrap"></div>'
			);
		}

		if (opts.pagination === true)
			wrap.append('<div class="camera_pag"></div>');

		wrap.append('<div class="camera_loader"></div>');

		$('.camera_caption', wrap).each(function () {
			$(this).wrapInner('<div></div>');
		});

		var pieID = 'pie_' + wrap.index();
		var elem = $('.camera_src', wrap);
		var target = $('.camera_target', wrap);
		var content = $('.camera_target_content', wrap);
		var pieContainer = $('.camera_pie', wrap);
		var barContainer = $('.camera_bar', wrap);
		var prevNav = $('.camera_prev', wrap);
		var nextNav = $('.camera_next', wrap);
		var commands = $('.camera_commands', wrap);
		var pagination = $('.camera_pag', wrap);
		var thumbs = $('.camera_thumbs_cont', wrap);
		var allImg = [];
		var allAlt = [];
		var allThumbAlt = [];
		var allLinks = [];
		var allTargets = [];
		var allPor = [];
		var allAlign = [];
		var allThumbs = [];
		var allContent = {};
		var globalContent = null;
		var globalContentContainer = null;

		var sliderI = 0;
		$('> div', elem).each(function () {
			if(! $(this).hasClass('camera_global_content')) {
				// Slider Images
				allImg.push($(this).attr('data-src'));

				// Alts
				if($(this).attr('data-alt'))
					allAlt.push($(this).attr('data-alt'));
				else
					allAlt.push('');
				if($(this).attr('data-alt-thumb'))
					allThumbAlt.push($(this).attr('data-alt-thumb'));
				else
					allThumbAlt.push('');

				// Link URLs
				if ($(this).attr('data-link'))
					allLinks.push($(this).attr('data-link'));
				else
					allLinks.push('');

				// URL Target
				if ($(this).attr('data-target'))
					allTargets.push($(this).attr('data-target'));
				else
					allTargets.push('');

				// Crop images
				if ($(this).attr('data-portrait'))
					allPor.push($(this).attr('data-portrait'));
				else
					allPor.push('');

				// Alignment
				if ($(this).attr('data-alignment'))
					allAlign.push($(this).attr('data-alignment'));
				else
					allAlign.push('');

				// Thumbnail Images
				if ($(this).attr('data-thumb'))
					allThumbs.push($(this).attr('data-thumb'));
				else
					allThumbs.push('');

				// Handle Caption
				var caption = $('.camera_caption', $(this));

				if(caption !== null && caption !== undefined && caption.length > 0)
					allContent[sliderI] = caption;

				sliderI++;
			} else
				globalContent = $(this);
		});

		var amountSlide = allImg.length;

		$(content).append('<div class="cameraContents"></div>');
		if(globalContent) {
			$('.cameraContents', content).append('<div class="cameraGlobal">' + globalContent.html() + '</div>');
			globalContentContainer = $('.cameraGlobal');
			globalContentContainer.hide();
		}
		var loopMove;
		for (loopMove = 0; loopMove < amountSlide; loopMove++) {
			$('.cameraContents', content).append('<div class="cameraContent"></div>');
			if (allLinks[loopMove] !== '') {
				// Only for WordPress Plugin
				var dataBox = $('> div ', elem).eq(loopMove).attr('data-box');
				if (typeof dataBox !== 'undefined' && dataBox !== false && dataBox !== '')
					dataBox = 'data-box="' + $('> div ', elem).eq(loopMove).attr('data-box') + '"';
				else
					dataBox = '';

				$('.camera_target_content .cameraContent:eq(' + loopMove + ')', wrap).append(
					'<a class="camera_link" href="' + allLinks[loopMove] + '" ' + dataBox + ' target="' + allTargets[loopMove] + '"></a>'
				);
			}

		}

		// Add content to the correct slider
		for(var n = 0; n < allImg.length; n++) {
			var sliderContent = allContent[n];

			if(sliderContent !== undefined && sliderContent !== null) {
				var cont = wrap.find('.cameraContent').eq(n);

				sliderContent.appendTo(cont);
			}
		}

		target.append('<div class="cameraCont"></div>');
		var cameraCont = $('.cameraCont', wrap);


		for (var loop = 0; loop < amountSlide; loop++) {
			cameraCont.append('<div class="cameraSlide cameraSlide_' + loop + '"></div>');
			var div = $('> div:eq(' + loop + ')', elem);
			target.find('.cameraSlide_' + loop).clone(div);
		}

		/**
		 *
		 */
		function thumbnailVisible() {
			var wTh = $(thumbs).width();
			$('li', thumbs).removeClass('camera_visThumb');
			$('li', thumbs).each(function () {
				var pos = $(this).position();
				var ulW = $('ul', thumbs).outerWidth();
				var offUl = $('ul', thumbs).offset().left;
				var offDiv = $('> div', thumbs).offset().left;
				var ulLeft = offDiv - offUl;

				if (ulLeft > 0)
					$('.camera_prevThumbs', camera_thumbs_wrap).removeClass('hideNav');
				else
					$('.camera_prevThumbs', camera_thumbs_wrap).addClass('hideNav');

				if ((ulW - ulLeft) > wTh)
					$('.camera_nextThumbs', camera_thumbs_wrap).removeClass('hideNav');
				else
					$('.camera_nextThumbs', camera_thumbs_wrap).addClass('hideNav');

				var left = pos.left;
				var right = left + ($(this).width());
				if (right - ulLeft <= wTh && left - ulLeft >= 0)
					$(this).addClass('camera_visThumb');
			});
		}

		$(window).bind('load resize pageshow', function () {
			thumbnailPos();
			thumbnailVisible();
		});

		cameraCont.append('<div class="cameraSlide cameraSlide_' + loop + '"></div>');

		var started;
		wrap.show();
		if(globalContentContainer)
			globalContentContainer.show();
		var w = target.width();
		var h = target.height();
		var setPause;

		$(window).bind('resize pageshow', function () {
			if (started === true)
				resizeImage();

			$('ul', thumbs).animate({'margin-top': 0}, 0, thumbnailPos);
			if (! elem.hasClass('paused')) {
				elem.addClass('paused');
				if ($('.camera_stop', camera_thumbs_wrap).length) {
					$('.camera_stop', camera_thumbs_wrap).hide();
					$('.camera_play', camera_thumbs_wrap).show();
					if (loader !== 'none')
						$('#' + pieID).hide();
				} else {
					if (loader !== 'none')
						$('#' + pieID).hide();
				}
				clearTimeout(setPause);
				setPause = setTimeout(function () {
					elem.removeClass('paused');
					if ($('.camera_play', camera_thumbs_wrap).length) {
						$('.camera_play', camera_thumbs_wrap).hide();
						$('.camera_stop', camera_thumbs_wrap).show();

						if (loader !== 'none')
							$('#' + pieID).fadeIn();
					} else {
						if (loader !== 'none')
							$('#' + pieID).fadeIn();
					}
				}, 1500);
			}
		});

		/**
		 *
		 */
		function resizeImage() {
			/**
			 *
			 */
			function resizeImageWork() {
				w = wrap.width();

				if (opts.height.indexOf('%') !== -1) {
					var startH = Math.round(w / (100 / parseFloat(opts.height)));

					if (opts.minHeight !== '' && startH < parseFloat(opts.minHeight))
						h = parseFloat(opts.minHeight);
					else
						h = startH;

					wrap.css({height: h});
				} else if (opts.height === 'auto')
					h = wrap.height();
				else {
					h = parseFloat(opts.height);
					wrap.css({height: h});
				}

				$('.camerarelative', target).css({'width': w, 'height': h});
				$('.imgLoaded', target).each(function () {
					var t = $(this);
					var wT = t.attr('width');
					var hT = t.attr('height');
					var mTop;
					var mLeft;
					var alignment = t.attr('data-alignment');
					var portrait = t.attr('data-portrait');
					var r;
					var d;

					if (typeof alignment === 'undefined' || alignment === false || alignment === '')
						alignment = opts.alignment;

					if (typeof portrait === 'undefined' || portrait === false || portrait === '')
						portrait = opts.portrait;

					if (portrait === false || portrait === 'false') {
						if ((wT / hT) < (w / h)) {
							r = w / wT;
							d = (Math.abs(h - (hT * r))) * 0.5;

							switch (alignment) {
								case 'topLeft':
									mTop = 0;
									break;
								case 'topCenter':
									mTop = 0;
									break;
								case 'topRight':
									mTop = 0;
									break;
								case 'centerLeft':
									mTop = '-' + d + 'px';
									break;
								case 'center':
									mTop = '-' + d + 'px';
									break;
								case 'centerRight':
									mTop = '-' + d + 'px';
									break;
								case 'bottomLeft':
									mTop = '-' + d * 2 + 'px';
									break;
								case 'bottomCenter':
									mTop = '-' + d * 2 + 'px';
									break;
								case 'bottomRight':
									mTop = '-' + d * 2 + 'px';
									break;
							}

							t.css({
								'height': hT * r,
								'margin-left': 0,
								'margin-right': 0,
								'margin-top': mTop,
								'position': 'absolute',
								'visibility': 'visible',
								'width': w
							});
						} else {
							r = h / hT;
							d = (Math.abs(w - (wT * r))) * 0.5;

							switch (alignment) {
								case 'topLeft':
									mLeft = 0;
									break;
								case 'topCenter':
									mLeft = '-' + d + 'px';
									break;
								case 'topRight':
									mLeft = '-' + d * 2 + 'px';
									break;
								case 'centerLeft':
									mLeft = 0;
									break;
								case 'center':
									mLeft = '-' + d + 'px';
									break;
								case 'centerRight':
									mLeft = '-' + d * 2 + 'px';
									break;
								case 'bottomLeft':
									mLeft = 0;
									break;
								case 'bottomCenter':
									mLeft = '-' + d + 'px';
									break;
								case 'bottomRight':
									mLeft = '-' + d * 2 + 'px';
									break;
							}

							t.css({
								'height': h,
								'margin-left': mLeft,
								'margin-right': mLeft,
								'margin-top': 0,
								'position': 'absolute',
								'visibility': 'visible',
								'width': wT * r
							});
						}
					} else {
						if ((wT / hT) < (w / h)) {
							r = h / hT;
							d = (Math.abs(w - (wT * r))) * 0.5;

							switch (alignment) {
								case 'topLeft':
									mLeft = 0;
									break;
								case 'topCenter':
									mLeft = d + 'px';
									break;
								case 'topRight':
									mLeft = d * 2 + 'px';
									break;
								case 'centerLeft':
									mLeft = 0;
									break;
								case 'center':
									mLeft = d + 'px';
									break;
								case 'centerRight':
									mLeft = d * 2 + 'px';
									break;
								case 'bottomLeft':
									mLeft = 0;
									break;
								case 'bottomCenter':
									mLeft = d + 'px';
									break;
								case 'bottomRight':
									mLeft = d * 2 + 'px';
									break;
							}

							t.css({
								'height': h,
								'margin-left': mLeft,
								'margin-right': mLeft,
								'margin-top': 0,
								'position': 'absolute',
								'visibility': 'visible',
								'width': wT * r
							});
						} else {
							r = w / wT;
							d = (Math.abs(h - (hT * r))) * 0.5;

							switch (alignment) {
								case 'topLeft':
									mTop = 0;
									break;
								case 'topCenter':
									mTop = 0;
									break;
								case 'topRight':
									mTop = 0;
									break;
								case 'centerLeft':
									mTop = d + 'px';
									break;
								case 'center':
									mTop = d + 'px';
									break;
								case 'centerRight':
									mTop = d + 'px';
									break;
								case 'bottomLeft':
									mTop = d * 2 + 'px';
									break;
								case 'bottomCenter':
									mTop = d * 2 + 'px';
									break;
								case 'bottomRight':
									mTop = d * 2 + 'px';
									break;
							}

							t.css({
								'height': hT * r,
								'margin-left': 0,
								'margin-right': 0,
								'margin-top': mTop,
								'position': 'absolute',
								'visibility': 'visible',
								'width': w
							});
						}
					}
				});
			}

			if (started === true)
				setTimeout(resizeImageWork, 200);
			else
				resizeImageWork();

			started = true;
		}

		var u;
		var setT;
		var autoAdv;
		var navHover;
		var videoHover;
		var videoPresent;

		if (isMobile() && opts.mobileAutoAdvance !== '')
			autoAdv = opts.mobileAutoAdvance;
		else
			autoAdv = opts.autoAdvance;

		if (autoAdv === false)
			elem.addClass('paused');

		if (isMobile() && opts.mobileNavHover !== '')
			navHover = opts.mobileNavHover;
		else
			navHover = opts.navigationHover;

		if (elem.length !== 0) {
			var selector = $('.cameraSlide', target);
			selector.wrapInner('<div class="camerarelative"></div>');

			var barDirection = opts.barDirection;
			var camera_thumbs_wrap = wrap;

			$('iframe', fakeHover).each(function () {
				var t = $(this);
				var src = t.attr('src');
				t.attr('data-src', src);
				var divInd = t.parent().index('.camera_src > div');
				$('.camera_target_content .cameraContent:eq(' + divInd + ')', wrap).append(t);
			});

			/**
			 *
			 */
			function imgFake() {
				$('iframe', fakeHover).each(function () {
					$('.camera_caption', fakeHover).show();
					var t = $(this);
					var cloneSrc = t.attr('data-src');
					t.attr('src', cloneSrc);
					var imgFakeUrl = opts.imagePath + 'blank.gif';
					var imgFake = new Image();
					imgFake.src = imgFakeUrl;

					if (opts.height.indexOf('%') !== -1) {
						var startH = Math.round(w / (100 / parseFloat(opts.height)));

						if (opts.minHeight !== '' && startH < parseFloat(opts.minHeight))
							h = parseFloat(opts.minHeight);
						else
							h = startH;
					} else if (opts.height === 'auto')
						h = wrap.height();
					else
						h = parseFloat(opts.height);

					t.after($(imgFake).attr({'class': 'imgFake', 'width': w, 'height': h}));
					var clone = t.clone();
					t.remove();

					$(imgFake).bind('click', function () {
						if ($(this).css('position') === 'absolute') {
							$(this).remove();
							var autoplay;

							if (cloneSrc.indexOf('vimeo') !== -1 || cloneSrc.indexOf('youtube') !== -1) {
								if (cloneSrc.indexOf('?') !== -1)
									autoplay = '&autoplay=1';
								else
									autoplay = '?autoplay=1';
							} else if (cloneSrc.indexOf('dailymotion') !== -1) {
								if (cloneSrc.indexOf('?') !== -1)
									autoplay = '&autoPlay=1';
								else
									autoplay = '?autoPlay=1';
							}
							clone.attr('src', cloneSrc + autoplay);
							videoPresent = true;
						} else {
							$(this).css({position: 'absolute', top: 0, left: 0, zIndex: 10}).after(clone);
							clone.css({position: 'absolute', top: 0, left: 0, zIndex: 9});
						}
					});
				});
			}

			imgFake();

			if (opts.hover === true) {
				if (! isMobile()) {
					fakeHover.hover(function () {
						elem.addClass('hovered');
					}, function () {
						elem.removeClass('hovered');
					});
				}
			}

			if (navHover === true) {
				$(prevNav, wrap).animate({opacity: 0}, 0);
				$(nextNav, wrap).animate({opacity: 0}, 0);
				$(commands, wrap).animate({opacity: 0}, 0);

				if (isMobile()) {
					$(document).on('vmouseover', fakeHoverSelector, function () {
						$(prevNav, wrap).animate({opacity: 1}, 200);
						$(nextNav, wrap).animate({opacity: 1}, 200);
						$(commands, wrap).animate({opacity: 1}, 200);
					});
					$(document).on('vmouseout', fakeHoverSelector, function () {
						$(prevNav, wrap).delay(500).animate({opacity: 0}, 200);
						$(nextNav, wrap).delay(500).animate({opacity: 0}, 200);
						$(commands, wrap).delay(500).animate({opacity: 0}, 200);
					});
				} else {
					fakeHover.hover(function () {
						$(prevNav, wrap).animate({opacity: 1}, 200);
						$(nextNav, wrap).animate({opacity: 1}, 200);
						$(commands, wrap).animate({opacity: 1}, 200);
					}, function () {
						$(prevNav, wrap).animate({opacity: 0}, 200);
						$(nextNav, wrap).animate({opacity: 0}, 200);
						$(commands, wrap).animate({opacity: 0}, 200);
					});
				}
			}

			camera_thumbs_wrap.on('click', '.camera_stop', function () {
				autoAdv = false;
				elem.addClass('paused');

				if ($('.camera_stop', camera_thumbs_wrap).length) {
					$('.camera_stop', camera_thumbs_wrap).hide();
					$('.camera_play', camera_thumbs_wrap).show();

					if (loader !== 'none')
						$('#' + pieID).hide();
				} else {
					if (loader !== 'none')
						$('#' + pieID).hide();
				}
			});

			camera_thumbs_wrap.on('click', '.camera_play', function () {
				autoAdv = true;
				elem.removeClass('paused');

				if ($('.camera_play', camera_thumbs_wrap).length) {
					$('.camera_play', camera_thumbs_wrap).hide();
					$('.camera_stop', camera_thumbs_wrap).show();

					if (loader !== 'none')
						$('#' + pieID).show();
				} else {
					if (loader !== 'none')
						$('#' + pieID).show();
				}
			});

			if (opts.pauseOnClick === true) {
				$('.camera_target_content', fakeHover).mouseup(function () {
					autoAdv = false;
					elem.addClass('paused');
					$('.camera_stop', camera_thumbs_wrap).hide();
					$('.camera_play', camera_thumbs_wrap).show();
					$('#' + pieID).hide();
				});
			}

			$('.cameraContent, .imgFake', fakeHover).hover(
				function () {
					videoHover = true;
				}, function () {
					videoHover = false;
				}
			);

			$('.cameraContent, .imgFake', fakeHover).bind('click', function () {
				if (videoPresent === true && videoHover === true) {
					autoAdv = false;
					$('.camera_caption', fakeHover).hide();
					elem.addClass('paused');
					$('.camera_stop', camera_thumbs_wrap).hide();
					$('.camera_play', camera_thumbs_wrap).show();
					$('#' + pieID).hide();
				}
			});
		}

		/**
		 *
		 * @param arr
		 * @returns {*}
		 */
		function shuffle(arr) {
			var i = arr.length;
			var j;
			var x;

			while(i) {
				j = parseInt(Math.random() * i);
				x = arr[--i];
				arr[i] = arr[j];
				arr[j] = x;
			}

			return arr;
		}

		var canvas;
		if (loader !== 'pie') {
			barContainer.append('<span class="camera_bar_cont"></span>');
			$('.camera_bar_cont', barContainer)
				.animate({opacity: opts.loaderOpacity}, 0)
				.css({
					'position': 'absolute',
					'left': 0,
					'right': 0,
					'top': 0,
					'bottom': 0,
					'background-color': opts.loaderBgColor
				})
				.append('<span id="' + pieID + '"></span>');

			canvas = $('#' + pieID);

			canvas.animate({opacity: 0}, 0);
			canvas.css({'position': 'absolute', 'background-color': opts.loaderColor});

			switch (opts.barPosition) {
				case 'left':
					barContainer.css({right: 'auto', width: opts.loaderStroke});
					break;
				case 'right':
					barContainer.css({left: 'auto', width: opts.loaderStroke});
					break;
				case 'top':
					barContainer.css({bottom: 'auto', height: opts.loaderStroke});
					break;
				case 'bottom':
					barContainer.css({top: 'auto', height: opts.loaderStroke});
					break;
			}

			switch (barDirection) {
				case 'leftToRight':
					canvas.css({'left': 0, 'right': 0, 'top': opts.loaderPadding, 'bottom': opts.loaderPadding});
					break;
				case 'rightToLeft':
					canvas.css({'left': 0, 'right': 0, 'top': opts.loaderPadding, 'bottom': opts.loaderPadding});
					break;
				case 'topToBottom':
					canvas.css({'left': opts.loaderPadding, 'right': opts.loaderPadding, 'top': 0, 'bottom': 0});
					break;
				case 'bottomToTop':
					canvas.css({'left': opts.loaderPadding, 'right': opts.loaderPadding, 'top': 0, 'bottom': 0});
					break;
			}
		} else {
			pieContainer.append('<canvas id="' + pieID + '"></canvas>');
			canvas = document.getElementById(pieID);

			canvas.setAttribute("width", opts.pieDiameter + 'px');
			canvas.setAttribute("height", opts.pieDiameter + 'px');

			var piePosition;
			switch (opts.piePosition) {
				case 'leftTop' :
					piePosition = 'left:0; top:0;';
					break;
				case 'rightTop' :
					piePosition = 'right:0; top:0;';
					break;
				case 'leftBottom' :
					piePosition = 'left:0; bottom:0;';
					break;
				case 'rightBottom' :
					piePosition = 'right:0; bottom:0;';
					break;
			}

			canvas.setAttribute("style", "position:absolute; z-index:1002; " + piePosition);
			var rad;
			var radNew;

			if (canvas && canvas.getContext) {
				var ctx = canvas.getContext("2d");
				ctx.rotate(Math.PI * (3 / 2));
				ctx.translate(-opts.pieDiameter, 0);
			}

		}

		if (loader === 'none' || autoAdv === false) {
			$('#' + pieID).hide();
			$('.camera_canvas_wrap', camera_thumbs_wrap).hide();
		}

		if ($(pagination).length) {
			$(pagination).append('<ul class="camera_pag_ul"></ul>');
			for (var li = 0; li < amountSlide; li++)
				$('.camera_pag_ul', wrap).append('<li class="pag_nav_' + li + '" style="position: relative; z-index: 1002;"><span><span>' + li + '</span></span></li>');

			$('.camera_pag_ul li', wrap).hover(function () {
				$(this).addClass('camera_hover');

				if ($('.camera_thumb', this).length) {
					var wTh = $('.camera_thumb', this).outerWidth();
					var hTh = $('.camera_thumb', this).outerHeight();
					var wTt = $(this).outerWidth();

					$('.camera_thumb', this).show().css({
						'top': '-' + hTh + 'px',
						'left': '-' + (wTh - wTt) / 2 + 'px'
					}).animate({'opacity': 1, 'margin-top': '-3px'}, 200);

					$('.thumb_arrow', this).show().animate({'opacity': 1, 'margin-top': '-3px'}, 200);
				}
			}, function () {
				$(this).removeClass('camera_hover');
				$('.camera_thumb', this).animate({'margin-top': '-20px', 'opacity': 0}, 200, function () {
					$(this).css({marginTop: '5px'}).hide();
				});
				$('.thumb_arrow', this).animate({'margin-top': '-20px', 'opacity': 0}, 200, function () {
					$(this).css({marginTop: '5px'}).hide();
				});
			});
		}

		if ($(thumbs).length) {
			var thumbUrl;

			if (! $(pagination).length) {
				$(thumbs).append('<div></div>');
				$(thumbs).before('<div class="camera_prevThumbs hideNav"><div></div></div>').before('<div class="camera_nextThumbs hideNav"><div></div></div>');
				$('> div', thumbs).append('<ul></ul>');

				$.each(allThumbs, function (i, val) {
					if(val) {
						var newImg = new Image();
						newImg.src = val;

						if(allThumbAlt[i])
							newImg.alt = allThumbAlt[i];

						$('ul', thumbs).append('<li class="pix_thumb pix_thumb_' + i + '"></li>');
						$('li.pix_thumb_' + i, thumbs).append($(newImg).attr('class', 'camera_thumb'));
					}
				});
			} else {
				$('> div', elem).each(function (i, val) {
					if(! $(this).hasClass('camera_global_content')) {
						if ($('> div', elem).eq(i).attr('data-thumb') !== '') {
							thumbUrl = $('> div', elem).eq(i).attr('data-thumb');
							var newImg = new Image();
							newImg.src = thumbUrl;

							// Get alt
							var n = null;
							$.each(allThumbs, function (i, val) {
								if(val === thumbUrl) {
									n = i;
									return false;
								}
							});
							if(allThumbAlt[n])
								newImg.alt = allThumbAlt[n];

							$('li.pag_nav_' + i, pagination).append($(newImg).attr('class', 'camera_thumb').css({'position': 'absolute'}).animate({opacity: 0}, 0));
							$('li.pag_nav_' + i + ' > img', pagination).after('<div class="thumb_arrow"></div>');
							$('li.pag_nav_' + i + ' > .thumb_arrow', pagination).animate({opacity: 0}, 0);
						}
					}
				});

				wrap.css({marginBottom: $(pagination).outerHeight()});
			}
		} else if (!$(thumbs).length && $(pagination).length)
			wrap.css({marginBottom: $(pagination).outerHeight()});

		var firstPos = true;

		/**
		 *
		 */
		function thumbnailPos() {
			if ($(thumbs).length && ! $(pagination).length) {
				var wTh = $(thumbs).outerWidth();
				var pos = $('li.cameracurrent', thumbs).length ? $('li.cameracurrent', thumbs).position() : '';
				var ulW = ($('ul > li', thumbs).length * $('ul > li', thumbs).outerWidth());
				var offUl = $('ul', thumbs).offset().left;
				var offDiv = $('> div', thumbs).offset().left;
				var ulLeft;

				if (offUl < 0)
					ulLeft = '-' + (offDiv - offUl);
				else
					ulLeft = offDiv - offUl;


				if (firstPos === true) {
					$('ul', thumbs).width($('ul > li', thumbs).length * $('ul > li', thumbs).outerWidth());

					if ($(thumbs).length && ! $(pagination).lenght)
						wrap.css({marginBottom: $(thumbs).outerHeight()});

					thumbnailVisible();

					// I repeat this two lines because of a problem with iPhones
					$('ul', thumbs).width($('ul > li', thumbs).length * $('ul > li', thumbs).outerWidth());

					if ($(thumbs).length && !$(pagination).lenght)
						wrap.css({marginBottom: $(thumbs).outerHeight()});
					// End of redo
				}

				firstPos = false;
				var left = $('li.cameracurrent', thumbs).length ? pos.left : '';
				var right = $('li.cameracurrent', thumbs).length ? pos.left + ($('li.cameracurrent', thumbs).outerWidth()) : '';

				if (left < $('li.cameracurrent', thumbs).outerWidth())
					left = 0;

				if (right - ulLeft > wTh) {
					if ((left + wTh) < ulW)
						$('ul', thumbs).animate({'margin-left': '-' + (left) + 'px'}, 500, thumbnailVisible);
					else
						$('ul', thumbs).animate({'margin-left': '-' + ($('ul', thumbs).outerWidth() - wTh) + 'px'}, 500, thumbnailVisible);
				} else if (left - ulLeft < 0)
					$('ul', thumbs).animate({'margin-left': '-' + (left) + 'px'}, 500, thumbnailVisible);
				else {
					$('ul', thumbs).css({'margin-left': 'auto', 'margin-right': 'auto'});
					setTimeout(thumbnailVisible, 100);
				}
			}
		}

		if ($(commands).length) {
			$(commands).append('<div class="camera_play"></div>').append('<div class="camera_stop"></div>');
			if (autoAdv === true) {
				$('.camera_play', camera_thumbs_wrap).hide();
				$('.camera_stop', camera_thumbs_wrap).show();
			} else {
				$('.camera_stop', camera_thumbs_wrap).hide();
				$('.camera_play', camera_thumbs_wrap).show();
			}
		}

		/**
		 *
		 */
		function canvasLoader() {
			rad = 0;
			var barWidth = $('.camera_bar_cont', camera_thumbs_wrap).width();
			var barHeight = $('.camera_bar_cont', camera_thumbs_wrap).height();
			var pieElement = $('#' + pieID);

			if (loader !== 'pie') {
				switch (barDirection) {
					case 'leftToRight':
						pieElement.css({'right': barWidth});
						break;
					case 'rightToLeft':
						pieElement.css({'left': barWidth});
						break;
					case 'topToBottom':
						pieElement.css({'bottom': barHeight});
						break;
					case 'bottomToTop':
						pieElement.css({'top': barHeight});
						break;
				}
			} else
				ctx.clearRect(0, 0, opts.pieDiameter, opts.pieDiameter);
		}

		canvasLoader();

		$('.moveFromLeft, .moveFromRight, .moveFromTop, .moveFromBottom, .fadeIn, .fadeFromLeft, .fadeFromRight, .fadeFromTop, .fadeFromBottom', fakeHover).each(function () {
			$(this).css('visibility', 'hidden');
		});

		opts.onStartLoading.call(this);
		nextSlide();

		/**
		 *
		 * @param navSlide
		 */
		function nextSlide(navSlide) {
			elem.addClass('camerasliding');
			videoPresent = false;
			var vis = parseFloat($('div.cameraSlide.cameracurrent', target).index());
			var slideI;

			if (navSlide > 0)
				slideI = navSlide - 1;
			else if (vis === (amountSlide - 1))
				slideI = 0;
			else
				slideI = vis + 1;

			var slide = $('.cameraSlide:eq(' + slideI + ')', target);
			var slideNext = $('.cameraSlide:eq(' + (slideI + 1) + ')', target).addClass('cameranext');

			if (vis !== (slideI + 1))
				slideNext.hide();

			$('.cameraContent', fakeHover).fadeOut(600);
			$('.camera_caption', fakeHover).show();
			$('.camerarelative', slide).append($('> div ', elem).eq(slideI).find('> div.camera_effected'));
			$('.camera_target_content .cameraContent:eq(' + slideI + ')', wrap).append($('> div ', elem).eq(slideI).find('> div'));

			if (!$('.imgLoaded', slide).length) {
				var imgUrl = allImg[slideI];
				var imgLoaded = new Image();
				imgLoaded.src = imgUrl + "?" + new Date().getTime();
				slide.css('visibility', 'hidden');
				slide.prepend($(imgLoaded).attr('class', 'imgLoaded').css('visibility', 'hidden'));
				var wT = null;
				var hT = null;

				if (! $(imgLoaded).get(0).complete || wT === '0' || hT === '0' || typeof wT === 'undefined' || wT === false || typeof hT === 'undefined' || hT === false) {
					$('.camera_loader', wrap).delay(500).fadeIn(400);

					imgLoaded.onload = function () {
						wT = imgLoaded.naturalWidth;
						hT = imgLoaded.naturalHeight;
						$(imgLoaded).attr('data-alignment', allAlign[slideI]).attr('data-portrait', allPor[slideI]);
						$(imgLoaded).attr('width', wT);
						$(imgLoaded).attr('height', hT);

						if(allAlt[slideI])
							$(imgLoaded).attr('alt', allAlt[slideI]);

						target.find('.cameraSlide_' + slideI).hide().css('visibility', 'visible');
						resizeImage();
						nextSlide(slideI + 1);
					};
				}
			} else {
				if (allImg.length > (slideI + 1) && ! $('.imgLoaded', slideNext).length) {
					var imgUrl2 = allImg[(slideI + 1)];
					var imgLoaded2 = new Image();
					imgLoaded2.src = imgUrl2 + "?" + new Date().getTime();
					slideNext.prepend($(imgLoaded2).attr('class', 'imgLoaded').css('visibility', 'hidden'));

					imgLoaded2.onload = function () {
						wT = imgLoaded2.naturalWidth;
						hT = imgLoaded2.naturalHeight;
						$(imgLoaded2).attr('data-alignment', allAlign[slideI + 1]).attr('data-portrait', allPor[slideI + 1]);
						$(imgLoaded2).attr('width', wT);
						$(imgLoaded2).attr('height', hT);

						if(allAlt[slideI + 1])
							$(imgLoaded).attr('alt', allAlt[slideI + 1]);

						resizeImage();
					};
				}

				opts.onLoaded.call(this);

				if ($('.camera_loader', wrap).is(':visible'))
					$('.camera_loader', wrap).fadeOut(400);
				else {
					$('.camera_loader', wrap).css({'visibility': 'hidden'});

					$('.camera_loader', wrap).fadeOut(400, function () {
						$('.camera_loader', wrap).css({'visibility': 'visible'});
					});
				}

				var rows = opts.rows;
				var cols = opts.cols;
				var couples = 1;
				var difference = 0;
				var dataSlideOn;
				var time;
				var transPeriod;
				var fx;
				var easing;
				var marginLeft = 0;
				var marginTop = 0;
				var opacityOnGrid = 0;
				var randomFx = [
					'simpleFade',
					'curtainTopLeft',
					'curtainTopRight',
					'curtainBottomLeft',
					'curtainBottomRight',
					'curtainSliceLeft',
					'curtainSliceRight',
					'blindCurtainTopLeft',
					'blindCurtainTopRight',
					'blindCurtainBottomLeft',
					'blindCurtainBottomRight',
					'blindCurtainSliceBottom',
					'blindCurtainSliceTop',
					'stampede',
					'mosaic',
					'mosaicReverse',
					'mosaicRandom',
					'mosaicSpiral',
					'mosaicSpiralReverse',
					'topLeftBottomRight',
					'bottomRightTopLeft',
					'bottomLeftTopRight',
					'topRightBottomLeft',
					'scrollLeft',
					'scrollRight',
					'scrollTop',
					'scrollBottom',
					'scrollHorz'
				];

				if (opts.opacityOnGrid === true)
					opacityOnGrid = 0;
				else
					opacityOnGrid = 1;

				var dataFx = $(' > div', elem).eq(slideI).attr('data-fx');

				if (isMobile() && opts.mobileFx !== '' && opts.mobileFx !== 'default')
					fx = opts.mobileFx;
				else {
					if (typeof dataFx !== 'undefined' && dataFx !== false && dataFx !== 'default')
						fx = dataFx;
					else
						fx = opts.fx;
				}

				if (fx === 'random') {
					fx = shuffle(randomFx);
					fx = fx[0];
				} else {
					if (fx.indexOf(',') > 0) {
						fx = fx.replace(/ /g, '');
						fx = fx.split(',');
						fx = shuffle(fx);
						fx = fx[0];
					}
				}

				var dataEasing = $(' > div', elem).eq(slideI).attr('data-easing');
				var mobileEasing = $(' > div', elem).eq(slideI).attr('data-mobileEasing');

				if (isMobile() && opts.mobileEasing !== '' && opts.mobileEasing !== 'default') {
					if (typeof mobileEasing !== 'undefined' && mobileEasing !== false && mobileEasing !== 'default')
						easing = mobileEasing;
					else
						easing = opts.mobileEasing;
				} else {
					if (typeof dataEasing !== 'undefined' && dataEasing !== false && dataEasing !== 'default')
						easing = dataEasing;
					else
						easing = opts.easing;
				}

				dataSlideOn = $(' > div', elem).eq(slideI).attr('data-slideOn');

				if (typeof dataSlideOn !== 'undefined' && dataSlideOn !== false)
					slideOn = dataSlideOn;
				else {
					if (opts.slideOn === 'random') {
						var slideOn = ['next', 'prev'];
						slideOn = shuffle(slideOn);
						slideOn = slideOn[0];
					} else
						slideOn = opts.slideOn;
				}

				var dataTime = $(' > div', elem).eq(slideI).attr('data-time');

				if (typeof dataTime !== 'undefined' && dataTime !== false && dataTime !== '')
					time = parseFloat(dataTime);
				else
					time = opts.time;

				var dataTransPeriod = $(' > div', elem).eq(slideI).attr('data-transPeriod');

				if (typeof dataTransPeriod !== 'undefined' && dataTransPeriod !== false && dataTransPeriod !== '')
					transPeriod = parseFloat(dataTransPeriod);
				else
					transPeriod = opts.transPeriod;

				if (! $(elem).hasClass('camerastarted')) {
					fx = 'simpleFade';
					slideOn = 'next';
					easing = '';
					transPeriod = 400;
					$(elem).addClass('camerastarted');
				}

				switch (fx) {
					case 'simpleFade':
						cols = 1;
						rows = 1;
						break;
					case 'curtainTopLeft':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'curtainTopRight':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'curtainBottomLeft':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'curtainBottomRight':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'curtainSliceLeft':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'curtainSliceRight':
						if (opts.slicedCols === 0)
							cols = opts.cols;
						else
							cols = opts.slicedCols;

						rows = 1;
						break;
					case 'blindCurtainTopLeft':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'blindCurtainTopRight':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'blindCurtainBottomLeft':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'blindCurtainBottomRight':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'blindCurtainSliceTop':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'blindCurtainSliceBottom':
						if (opts.slicedRows === 0)
							rows = opts.rows;
						else
							rows = opts.slicedRows;

						cols = 1;
						break;
					case 'stampede':
						difference = '-' + transPeriod;
						break;
					case 'mosaic':
						difference = opts.gridDifference;
						break;
					case 'mosaicReverse':
						difference = opts.gridDifference;
						break;
					case 'mosaicRandom':
						// VOID
						break;
					case 'mosaicSpiral':
						difference = opts.gridDifference;
						couples = 1.7;
						break;
					case 'mosaicSpiralReverse':
						difference = opts.gridDifference;
						couples = 1.7;
						break;
					case 'topLeftBottomRight':
						difference = opts.gridDifference;
						couples = 6;
						break;
					case 'bottomRightTopLeft':
						difference = opts.gridDifference;
						couples = 6;
						break;
					case 'bottomLeftTopRight':
						difference = opts.gridDifference;
						couples = 6;
						break;
					case 'topRightBottomLeft':
						difference = opts.gridDifference;
						couples = 6;
						break;
					case 'scrollLeft':
						cols = 1;
						rows = 1;
						break;
					case 'scrollRight':
						cols = 1;
						rows = 1;
						break;
					case 'scrollTop':
						cols = 1;
						rows = 1;
						break;
					case 'scrollBottom':
						cols = 1;
						rows = 1;
						break;
					case 'scrollHorz':
						cols = 1;
						rows = 1;
						break;
				}

				var cycle = 0;
				var blocks = rows * cols;
				var leftScrap = w - (Math.floor(w / cols) * cols);
				var topScrap = h - (Math.floor(h / rows) * rows);
				var addLeft;
				var addTop;
				var tAppW = 0;
				var tAppH = 0;
				var arr = [];
				var delay = [];
				var order = [];

				while (cycle < blocks) {
					arr.push(cycle);
					delay.push(cycle);
					cameraCont.append('<div class="cameraappended" style="display:none; overflow:hidden; position:absolute; z-index:1000"></div>');
					var tApp = $('.cameraappended:eq(' + cycle + ')', target);

					if (fx === 'scrollLeft' || fx === 'scrollRight' || fx === 'scrollTop' || fx === 'scrollBottom' || fx === 'scrollHorz')
						selector.eq(slideI).clone().show().appendTo(tApp);
					else {
						if (slideOn === 'next')
							selector.eq(slideI).clone().show().appendTo(tApp);
						else
							selector.eq(vis).clone().show().appendTo(tApp);
					}

					if (cycle % cols < leftScrap)
						addLeft = 1;
					else
						addLeft = 0;

					if ((cycle % cols) === 0)
						tAppW = 0;
					if (Math.floor(cycle / cols) < topScrap)
						addTop = 1;
					else
						addTop = 0;

					tApp.css({
						'height': Math.floor((h / rows) + addTop + 1),
						'left': tAppW,
						'top': tAppH,
						'width': Math.floor((w / cols) + addLeft + 1)
					});
					$('> .cameraSlide', tApp).css({
						'height': h,
						'margin-left': '-' + tAppW + 'px',
						'margin-top': '-' + tAppH + 'px',
						'width': w
					});
					tAppW = tAppW + tApp.width() - 1;

					if ((cycle % cols) === (cols - 1))
						tAppH = tAppH + tApp.height() - 1;

					cycle++;
				}

				var rows2;
				var x;
				var y;
				var z;
				var n;
				switch (fx) {
					case 'curtainTopLeft':
						break;
					case 'curtainBottomLeft':
						break;
					case 'curtainSliceLeft':
						break;
					case 'curtainTopRight':
						arr = arr.reverse();
						break;
					case 'curtainBottomRight':
						arr = arr.reverse();
						break;
					case 'curtainSliceRight':
						arr = arr.reverse();
						break;
					case 'blindCurtainTopLeft':
						break;
					case 'blindCurtainBottomLeft':
						arr = arr.reverse();
						break;
					case 'blindCurtainSliceTop':
						break;
					case 'blindCurtainTopRight':
						break;
					case 'blindCurtainBottomRight':
						arr = arr.reverse();
						break;
					case 'blindCurtainSliceBottom':
						arr = arr.reverse();
						break;
					case 'stampede':
						arr = shuffle(arr);
						break;
					case 'mosaic':
						break;
					case 'mosaicReverse':
						arr = arr.reverse();
						break;
					case 'mosaicRandom':
						arr = shuffle(arr);
						break;
					case 'mosaicSpiral':
						rows2 = rows / 2;
						n = 0;
						for (z = 0; z < rows2; z++) {
							y = z;
							for (x = z; x < cols - z - 1; x++)
								order[n++] = y * cols + x;

							x = cols - z - 1;
							for (y = z; y < rows - z - 1; y++)
								order[n++] = y * cols + x;

							y = rows - z - 1;
							for (x = cols - z - 1; x > z; x--)
								order[n++] = y * cols + x;

							x = z;
							for (y = rows - z - 1; y > z; y--)
								order[n++] = y * cols + x;
						}

						arr = order;
						break;
					case 'mosaicSpiralReverse':
						rows2 = rows / 2;
						n = blocks - 1;
						for (z = 0; z < rows2; z++) {
							y = z;
							for (x = z; x < cols - z - 1; x++)
								order[n--] = y * cols + x;

							x = cols - z - 1;
							for (y = z; y < rows - z - 1; y++)
								order[n--] = y * cols + x;

							y = rows - z - 1;
							for (x = cols - z - 1; x > z; x--)
								order[n--] = y * cols + x;

							x = z;
							for (y = rows - z - 1; y > z; y--)
								order[n--] = y * cols + x;
						}

						arr = order;
						break;
					case 'topLeftBottomRight':
						for (y = 0; y < rows; y++) {
							for (x = 0; x < cols; x++)
								order.push(x + y);
						}

						delay = order;
						break;
					case 'bottomRightTopLeft':
						for (y = 0; y < rows; y++) {
							for (x = 0; x < cols; x++)
								order.push(x + y);
						}

						delay = order.reverse();
						break;
					case 'bottomLeftTopRight':
						for (y = rows; y > 0; y--) {
							for (x = 0; x < cols; x++)
								order.push(x + y);
						}

						delay = order;
						break;
					case 'topRightBottomLeft':
						for (y = 0; y < rows; y++) {
							for (x = cols; x > 0; x--)
								order.push(x + y);
						}

						delay = order;
						break;
				}

				$.each(arr, function (index, value) {
					if ((value % cols) < leftScrap)
						addLeft = 1;
					else
						addLeft = 0;

					if ((value % cols) === 0)
						tAppW = 0;

					if (Math.floor(value / cols) < topScrap)
						addTop = 1;
					else
						addTop = 0;

					var height = 0;
					var width = 0;

					switch (fx) {
						case 'simpleFade':
							height = h;
							width = w;
							opacityOnGrid = 0;
							break;
						case 'curtainTopLeft':
							width = Math.floor((w / cols) + addLeft + 1);
							marginTop = '-' + Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'curtainTopRight':
							width = Math.floor((w / cols) + addLeft + 1);
							marginTop = '-' + Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'curtainBottomLeft':
							width = Math.floor((w / cols) + addLeft + 1);
							marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'curtainBottomRight':
							width = Math.floor((w / cols) + addLeft + 1);
							marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'curtainSliceLeft':
							width = Math.floor((w / cols) + addLeft + 1);

							if ((value % 2) === 0)
								marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							else
								marginTop = '-' + Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'curtainSliceRight':
							width = Math.floor((w / cols) + addLeft + 1);

							if ((value % 2) === 0)
								marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							else
								marginTop = '-' + Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'blindCurtainTopLeft':
							height = Math.floor((h / rows) + addTop + 1);
							marginLeft = '-' + Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'blindCurtainTopRight':
							height = Math.floor((h / rows) + addTop + 1);
							marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'blindCurtainBottomLeft':
							height = Math.floor((h / rows) + addTop + 1);
							marginLeft = '-' + Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'blindCurtainBottomRight':
							height = Math.floor((h / rows) + addTop + 1);
							marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'blindCurtainSliceBottom':
							height = Math.floor((h / rows) + addTop + 1);

							if ((value % 2) === 0)
								marginLeft = '-' + Math.floor((w / cols) + addLeft + 1) + 'px';
							else
								marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'blindCurtainSliceTop':
							height = Math.floor((h / rows) + addTop + 1);

							if ((value % 2) === 0)
								marginLeft = '-' + Math.floor((w / cols) + addLeft + 1) + 'px';
							else
								marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							break;
						case 'stampede':
							marginLeft = (w * 0.2) * (((index) % cols) - (cols - (Math.floor(cols / 2)))) + 'px';
							marginTop = (h * 0.2) * ((Math.floor(index / cols) + 1) - (rows - (Math.floor(rows / 2)))) + 'px';
							break;
						case 'mosaic':
							break;
						case 'mosaicReverse':
							marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'mosaicRandom':
							marginLeft = Math.floor((w / cols) + addLeft + 1) * 0.5 + 'px';
							marginTop = Math.floor((h / rows) + addTop + 1) * 0.5 + 'px';
							break;
						case 'mosaicSpiral':
							marginLeft = Math.floor((w / cols) + addLeft + 1) * 0.5 + 'px';
							marginTop = Math.floor((h / rows) + addTop + 1) * 0.5 + 'px';
							break;
						case 'mosaicSpiralReverse':
							marginLeft = Math.floor((w / cols) + addLeft + 1) * 0.5 + 'px';
							marginTop = Math.floor((h / rows) + addTop + 1) * 0.5 + 'px';
							break;
						case 'topLeftBottomRight':
							break;
						case 'bottomRightTopLeft':
							marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'bottomLeftTopRight':
							marginLeft = 0;
							marginTop = Math.floor((h / rows) + addTop + 1) + 'px';
							break;
						case 'topRightBottomLeft':
							marginLeft = Math.floor((w / cols) + addLeft + 1) + 'px';
							marginTop = 0;
							break;
						case 'scrollRight':
							height = h;
							width = w;
							marginLeft = -w;
							break;
						case 'scrollLeft':
							height = h;
							width = w;
							marginLeft = w;
							break;
						case 'scrollTop':
							height = h;
							width = w;
							marginTop = h;
							break;
						case 'scrollBottom':
							height = h;
							width = w;
							marginTop = -h;
							break;
						case 'scrollHorz':
							height = h;
							width = w;

							if (vis === 0 && slideI === (amountSlide - 1))
								marginLeft = -w;
							else if (vis < slideI || (vis === (amountSlide - 1) && slideI === 0))
								marginLeft = w;
							else
								marginLeft = -w;
							break;
					}


					var tApp = $('.cameraappended:eq(' + value + ')', target);

					if (typeof u !== 'undefined') {
						clearInterval(u);
						clearTimeout(setT);
						setT = setTimeout(canvasLoader, transPeriod + difference);
					}


					if ($(pagination).length) {
						$('.camera_pag li', wrap).removeClass('cameracurrent');
						$('.camera_pag li', wrap).eq(slideI).addClass('cameracurrent');
					}

					if ($(thumbs).length) {
						$('li', thumbs).removeClass('cameracurrent');
						$('li', thumbs).eq(slideI).addClass('cameracurrent');
						$('li', thumbs).not('.cameracurrent').find('img').animate({opacity: .5}, 0);
						$('li.cameracurrent img', thumbs).animate({opacity: 1}, 0);

						$('li', thumbs).hover(
							function () {
								$('img', this).stop(true, false).animate({opacity: 1}, 150);
							}, function () {
								if (!$(this).hasClass('cameracurrent'))
									$('img', this).stop(true, false).animate({opacity: .5}, 150);
							}
						);
					}

					var easedTime = parseFloat(transPeriod) + parseFloat(difference);

					/**
					 *
					 */
					function cameraeased() {
						$(this).addClass('cameraeased');
						if ($('.cameraeased', target).length >= 0)
							$(thumbs).css({visibility: 'visible'});

						if ($('.cameraeased', target).length === blocks) {
							thumbnailPos();

							$('.moveFromLeft, .moveFromRight, .moveFromTop, .moveFromBottom, .fadeIn, .fadeFromLeft, .fadeFromRight, .fadeFromTop, .fadeFromBottom', fakeHover).each(
								function () {
									$(this).css('visibility', 'hidden');
								}
							);

							selector.eq(slideI).show().css('z-index', '999').removeClass('cameranext').addClass('cameracurrent');
							selector.eq(vis).css('z-index', '1').removeClass('cameracurrent');
							$('.cameraContent', fakeHover).eq(slideI).addClass('cameracurrent');

							if (vis >= 0)
								$('.cameraContent', fakeHover).eq(vis).removeClass('cameracurrent');

							opts.onEndTransition.call(this);

							if ($('> div', elem).eq(slideI).attr('data-video') !== 'hide' && $('.cameraContent.cameracurrent .imgFake', fakeHover).length)
								$('.cameraContent.cameracurrent .imgFake', fakeHover).click();

							var lMoveIn = selector.eq(slideI).find('.fadeIn').length;
							var lMoveInContent = $('.cameraContent', fakeHover).eq(slideI).find('.moveFromLeft, .moveFromRight, .moveFromTop, .moveFromBottom, .fadeIn, .fadeFromLeft, .fadeFromRight, .fadeFromTop, .fadeFromBottom').length;

							if (lMoveIn !== 0) {
								$('.cameraSlide.cameracurrent .fadeIn', fakeHover).each(function () {
									var easeMove;
									if ($(this).attr('data-easing') !== '')
										easeMove = $(this).attr('data-easing');
									else
										easeMove = easing;

									var t = $(this);
									if (typeof t.attr('data-outerWidth') === 'undefined' || t.attr('data-outerWidth') === false || t.attr('data-outerWidth') === '')
										t.attr('data-outerWidth', t.outerWidth());
									if (typeof t.attr('data-outerHeight') === 'undefined' || t.attr('data-outerHeight') === false || t.attr('data-outerHeight') === '')
										t.attr('data-outerHeight', t.outerHeight());

									var tClass = t.attr('class');
									var ind = t.index();

									if (tClass.indexOf("fadeIn") !== -1)
										t.animate({opacity: 0}, 0).css('visibility', 'visible').delay((time / lMoveIn) * (0.1 * (ind - 1))).animate({opacity: 1}, (time / lMoveIn) * 0.15, easeMove);
									else
										t.css('visibility', 'visible');
								});
							}

							$('.cameraContent.cameracurrent', fakeHover).show();
							if (lMoveInContent !== 0) {

								$('.cameraContent.cameracurrent .moveFromLeft, .cameraContent.cameracurrent .moveFromRight, .cameraContent.cameracurrent .moveFromTop, .cameraContent.cameracurrent .moveFromBottom, .cameraContent.cameracurrent .fadeIn, .cameraContent.cameracurrent .fadeFromLeft, .cameraContent.cameracurrent .fadeFromRight, .cameraContent.cameracurrent .fadeFromTop, .cameraContent.cameracurrent .fadeFromBottom', fakeHover).each(function () {
									var t = $(this);
									var pos = t.position();
									var tClass = t.attr('class');
									var ind = t.index();
									var thisH = t.outerHeight();
									var easeMove;

									if ($(this).attr('data-easing') !== '')
										easeMove = $(this).attr('data-easing');
									else
										easeMove = easing;

									if (tClass.indexOf("moveFromLeft") !== -1) {
										t.css({'left': '-' + (w) + 'px', 'right': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({'left': pos.left}, (time / lMoveInContent) * 0.15, easeMove);
									} else if (tClass.indexOf("moveFromRight") !== -1) {
										t.css({'left': w + 'px', 'right': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({'left': pos.left}, (time / lMoveInContent) * 0.15, easeMove);
									} else if (tClass.indexOf("moveFromTop") !== -1) {
										t.css({'top': '-' + h + 'px', 'bottom': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({'top': pos.top}, (time / lMoveInContent) * 0.15, easeMove, function () {
											t.css({top: 'auto', bottom: 0});
										});
									} else if (tClass.indexOf("moveFromBottom") !== -1) {
										t.css({'top': h + 'px', 'bottom': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({'top': pos.top}, (time / lMoveInContent) * 0.15, easeMove);
									} else if (tClass.indexOf("fadeFromLeft") !== -1) {
										t.animate({opacity: 0}, 0).css({'left': '-' + (w) + 'px', 'right': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({
											'left': pos.left,
											opacity: 1
										}, (time / lMoveInContent) * 0.15, easeMove);
									} else if (tClass.indexOf("fadeFromRight") !== -1) {
										t.animate({opacity: 0}, 0).css({'left': (w) + 'px', 'right': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({
											'left': pos.left,
											opacity: 1
										}, (time / lMoveInContent) * 0.15, easeMove);
									} else if (tClass.indexOf("fadeFromTop") !== -1) {
										t.animate({opacity: 0}, 0).css({'top': '-' + (h) + 'px', 'bottom': 'auto'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({
											'top': pos.top,
											opacity: 1
										}, (time / lMoveInContent) * 0.15, easeMove, function () {
											t.css({top: 'auto', bottom: 0});
										});
									} else if (tClass.indexOf("fadeFromBottom") !== -1) {
										t.animate({opacity: 0}, 0).css({'bottom': '-' + thisH + 'px'});
										t.css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({
												'bottom': '0',
												opacity: 1
											},
											(time / lMoveInContent) * 0.15,
											easeMove
										);
									} else if (tClass.indexOf("fadeIn") !== -1)
										t.animate({opacity: 0}, 0).css('visibility', 'visible').delay((time / lMoveInContent) * (0.1 * (ind - 1))).animate({opacity: 1}, (time / lMoveInContent) * 0.15, easeMove);
									else
										t.css('visibility', 'visible');
								});
							}

							$('.cameraappended', target).remove();
							elem.removeClass('camerasliding');
							selector.eq(vis).hide();

							var barWidth = $('.camera_bar_cont', camera_thumbs_wrap).width();
							var barHeight = $('.camera_bar_cont', camera_thumbs_wrap).height();
							var radSum;

							if (loader !== 'pie')
								radSum = 0.05;
							else
								radSum = 0.005;

							$('#' + pieID).animate({opacity: opts.loaderOpacity}, 200);
							u = setInterval(
								function () {
									if (elem.hasClass('stopped'))
										clearInterval(u);

									if (loader !== 'pie') {
										var pieElement = $('#' + pieID);

										if (rad <= 1.002 && ! elem.hasClass('stopped') && ! elem.hasClass('paused') && ! elem.hasClass('hovered'))
											rad = (rad + radSum);
										else if (rad <= 1 && (elem.hasClass('stopped') || elem.hasClass('paused') || elem.hasClass('stopped') || elem.hasClass('hovered'))) {
											// VOID
										} else {
											if (! elem.hasClass('stopped') && ! elem.hasClass('paused') && ! elem.hasClass('hovered')) {
												clearInterval(u);
												imgFake();

												pieElement.animate({opacity: 0}, 200, function () {
													clearTimeout(setT);
													setT = setTimeout(canvasLoader, easedTime);
													nextSlide();
													opts.onStartLoading.call(this);
												});
											}
										}

										switch (barDirection) {
											case 'leftToRight':
												pieElement.animate({'right': barWidth - (barWidth * rad)}, (time * radSum), 'linear');
												break;
											case 'rightToLeft':
												pieElement.animate({'left': barWidth - (barWidth * rad)}, (time * radSum), 'linear');
												break;
											case 'topToBottom':
												pieElement.animate({'bottom': barHeight - (barHeight * rad)}, (time * radSum), 'linear');
												break;
											case 'bottomToTop':
												pieElement.animate({'bottom': barHeight - (barHeight * rad)}, (time * radSum), 'linear');
												break;
										}
									} else {
										radNew = rad;
										ctx.clearRect(0, 0, opts.pieDiameter, opts.pieDiameter);
										ctx.globalCompositeOperation = 'destination-over';
										ctx.beginPath();
										ctx.arc((opts.pieDiameter) / 2, (opts.pieDiameter) / 2, (opts.pieDiameter) / 2 - opts.loaderStroke, 0, Math.PI * 2, false);
										ctx.lineWidth = opts.loaderStroke;
										ctx.strokeStyle = opts.loaderBgColor;
										ctx.stroke();
										ctx.closePath();
										ctx.globalCompositeOperation = 'source-over';
										ctx.beginPath();
										ctx.arc((opts.pieDiameter) / 2, (opts.pieDiameter) / 2, (opts.pieDiameter) / 2 - opts.loaderStroke, 0, Math.PI * 2 * radNew, false);
										ctx.lineWidth = opts.loaderStroke - (opts.loaderPadding * 2);
										ctx.strokeStyle = opts.loaderColor;
										ctx.stroke();
										ctx.closePath();

										if (rad <= 1.002 && ! elem.hasClass('stopped') && ! elem.hasClass('paused') && ! elem.hasClass('hovered'))
											rad = (rad + radSum);
										else if (rad <= 1 && (elem.hasClass('stopped') || elem.hasClass('paused') || elem.hasClass('hovered'))) {
											// VOID
										} else {
											if (! elem.hasClass('stopped') && ! elem.hasClass('paused') && ! elem.hasClass('hovered')) {
												clearInterval(u);
												imgFake();

												$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 200, function () {
													clearTimeout(setT);
													setT = setTimeout(canvasLoader, easedTime);
													nextSlide();
													opts.onStartLoading.call(this);
												});
											}
										}
									}
								}, time * radSum
							);
						}
					}

					if (fx === 'scrollLeft' || fx === 'scrollRight' || fx === 'scrollTop' || fx === 'scrollBottom' || fx === 'scrollHorz') {
						opts.onStartTransition.call(this);
						easedTime = 0;
						tApp.delay((((transPeriod + difference) / blocks) * delay[index] * couples) * 0.5).css({
							'display': 'block',
							'height': height,
							'margin-left': marginLeft,
							'margin-top': marginTop,
							'width': width
						}).animate({
							'height': Math.floor((h / rows) + addTop + 1),
							'margin-top': 0,
							'margin-left': 0,
							'width': Math.floor((w / cols) + addLeft + 1)
						}, (transPeriod - difference), easing, cameraeased);
						selector.eq(vis).delay((((transPeriod + difference) / blocks) * delay[index] * couples) * 0.5).animate({
							'margin-left': marginLeft * (-1),
							'margin-top': marginTop * (-1)
						}, (transPeriod - difference), easing, function () {
							$(this).css({'margin-top': 0, 'margin-left': 0});
						});
					} else {
						opts.onStartTransition.call(this);
						easedTime = parseFloat(transPeriod) + parseFloat(difference);
						if (slideOn === 'next') {
							tApp.delay((((transPeriod + difference) / blocks) * delay[index] * couples) * 0.5).css({
								'display': 'block',
								'height': height,
								'margin-left': marginLeft,
								'margin-top': marginTop,
								'width': width,
								'opacity': opacityOnGrid
							}).animate({
								'height': Math.floor((h / rows) + addTop + 1),
								'margin-top': 0,
								'margin-left': 0,
								'opacity': 1,
								'width': Math.floor((w / cols) + addLeft + 1)
							}, (transPeriod - difference), easing, cameraeased);
						} else {
							selector.eq(slideI).show().css('z-index', '999').addClass('cameracurrent');
							selector.eq(vis).css('z-index', '1').removeClass('cameracurrent');
							$('.cameraContent', fakeHover).eq(slideI).addClass('cameracurrent');
							$('.cameraContent', fakeHover).eq(vis).removeClass('cameracurrent');
							tApp.delay((((transPeriod + difference) / blocks) * delay[index] * couples) * 0.5).css({
								'display': 'block',
								'height': Math.floor((h / rows) + addTop + 1),
								'margin-top': 0,
								'margin-left': 0,
								'opacity': 1,
								'width': Math.floor((w / cols) + addLeft + 1)
							}).animate({
								'height': height,
								'margin-left': marginLeft,
								'margin-top': marginTop,
								'width': width,
								'opacity': opacityOnGrid
							}, (transPeriod - difference), easing, cameraeased);
						}
					}
				});
			}
		}

		if ($(prevNav).length) {
			$(prevNav).click(function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($('.cameraSlide.cameracurrent', target).index());
					clearInterval(u);
					imgFake();
					$('#' + pieID + ', .camera_canvas_wrap', wrap).animate({opacity: 0}, 0);
					canvasLoader();

					if (idNum !== 0)
						nextSlide(idNum);
					else
						nextSlide(amountSlide);

					opts.onStartLoading.call(this);
				}
			});
		}

		if ($(nextNav).length) {
			$(nextNav).click(function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($('.cameraSlide.cameracurrent', target).index());
					clearInterval(u);
					imgFake();
					$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 0);
					canvasLoader();

					if (idNum === (amountSlide - 1))
						nextSlide(1);
					else
						nextSlide(idNum + 2);

					opts.onStartLoading.call(this);
				}
			});
		}

		if (isMobile()) {
			fakeHover.bind('swipeleft', function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($('.cameraSlide.cameracurrent', target).index());
					clearInterval(u);
					imgFake();
					$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 0);
					canvasLoader();

					if (idNum === (amountSlide - 1))
						nextSlide(1);
					else
						nextSlide(idNum + 2);

					opts.onStartLoading.call(this);
				}
			});

			fakeHover.bind('swiperight', function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($('.cameraSlide.cameracurrent', target).index());
					clearInterval(u);
					imgFake();
					$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 0);
					canvasLoader();

					if (idNum !== 0)
						nextSlide(idNum);
					else
						nextSlide(amountSlide);

					opts.onStartLoading.call(this);
				}
			});
		}

		if ($(pagination).length) {
			$('.camera_pag li', wrap).click(function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($(this).index());
					var curNum = parseFloat($('.cameraSlide.cameracurrent', target).index());

					if (idNum !== curNum) {
						clearInterval(u);
						imgFake();
						$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 0);
						canvasLoader();
						nextSlide(idNum + 1);
						opts.onStartLoading.call(this);
					}
				}
			});
		}

		if ($(thumbs).length) {
			$('.pix_thumb img', thumbs).click(function () {
				if (! elem.hasClass('camerasliding')) {
					var idNum = parseFloat($(this).parents('li').index());
					var curNum = parseFloat($('.cameracurrent', target).index());

					if (idNum !== curNum) {
						clearInterval(u);
						imgFake();
						$('#' + pieID + ', .camera_canvas_wrap', camera_thumbs_wrap).animate({opacity: 0}, 0);
						$('.pix_thumb', thumbs).removeClass('cameracurrent');
						$(this).parents('li').addClass('cameracurrent');
						canvasLoader();
						nextSlide(idNum + 1);
						thumbnailPos();
						opts.onStartLoading.call(this);
					}
				}
			});

			$('.camera_thumbs_cont .camera_prevThumbs', camera_thumbs_wrap).hover(function () {
				$(this).stop(true, false).animate({opacity: 1}, 250);
			}, function () {
				$(this).stop(true, false).animate({opacity: .7}, 250);
			});
			$('.camera_prevThumbs', camera_thumbs_wrap).click(function () {
				var sum = 0;
				var offUl = $('ul', thumbs).offset().left;
				var offDiv = $('> div', thumbs).offset().left;
				var ulLeft = offDiv - offUl;

				$('.camera_visThumb', thumbs).each(function () {
					var tW = $(this).outerWidth();
					sum = sum + tW;
				});

				if (ulLeft - sum > 0)
					$('ul', thumbs).animate({'margin-left': '-' + (ulLeft - sum) + 'px'}, 500, thumbnailVisible);
				else
					$('ul', thumbs).animate({'margin-left': 0}, 500, thumbnailVisible);
			});

			$('.camera_thumbs_cont .camera_nextThumbs', camera_thumbs_wrap).hover(function () {
				$(this).stop(true, false).animate({opacity: 1}, 250);
			}, function () {
				$(this).stop(true, false).animate({opacity: .7}, 250);
			});
			$('.camera_nextThumbs', camera_thumbs_wrap).click(function () {
				var sum = 0;
				var wTh = $(thumbs).outerWidth();
				var ulW = $('ul', thumbs).outerWidth();
				var offUl = $('ul', thumbs).offset().left;
				var offDiv = $('> div', thumbs).offset().left;
				var ulLeft = offDiv - offUl;

				$('.camera_visThumb', thumbs).each(function () {
					var tW = $(this).outerWidth();
					sum = sum + tW;
				});

				if ((ulLeft + sum + sum) < ulW)
					$('ul', thumbs).animate({'margin-left': '-' + (ulLeft + sum) + 'px'}, 500, thumbnailVisible);
				else
					$('ul', thumbs).animate({'margin-left': '-' + (ulW - wTh) + 'px'}, 500, thumbnailVisible);
			});
		}
	}

})(jQuery);

(function ($) {
	$.fn.cameraStop = function () {
		var wrap = $(this);
		var camera_thumbs_wrap;
		var elem = $('.camera_src', wrap);
		elem.addClass('stopped');

		if ($('.camera_showcommands').length)
			camera_thumbs_wrap = $('.camera_thumbs_wrap', wrap);
		else
			camera_thumbs_wrap = wrap;
	}
})(jQuery);

(function ($) {
	$.fn.cameraPause = function () {
		var wrap = $(this);
		var elem = $('.camera_src', wrap);
		elem.addClass('paused');
	}
})(jQuery);

(function ($) {
	$.fn.cameraResume = function () {
		var wrap = $(this);
		var elem = $('.camera_src', wrap);

		if (typeof autoAdv === 'undefined' || autoAdv !== true)
			elem.removeClass('paused');
	}
})(jQuery);
