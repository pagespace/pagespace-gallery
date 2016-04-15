window.pagespace = window.pagespace || {};
window.pagespace.gallery = function(galleryId) {

    function launchLightbox(src, caption) {
        //elements
        var lightboxFrag = document.createDocumentFragment();

        var wrapperEl = document.createElement('div');
        wrapperEl.classList.add('pagespace-gallery-lightbox');

        var loadingEl = document.createElement('div');
        loadingEl.classList.add('signal');

        var imgEl = document.createElement('img');
        imgEl.src = src;

        var captionEl = document.createElement('span');
        captionEl.classList.add('pagespace-gallery-caption');
        captionEl.textContent = caption;

        wrapperEl.appendChild(captionEl);
        wrapperEl.appendChild(loadingEl);
        lightboxFrag.appendChild(wrapperEl);

        imgEl.addEventListener('load', function() {
            wrapperEl.appendChild(imgEl);
            wrapperEl.classList.add('pagespace-gallery-loaded');

            var actualWidth = imgEl.offsetWidth;
            var actualHeight = imgEl.offsetHeight;
            var imageRatio = actualWidth / actualHeight;

            var displayWidth, displayHeight;
            if(actualWidth > actualHeight) {
                displayWidth = Math.min(actualWidth, window.innerWidth - 200);
                displayHeight = displayWidth / imageRatio;
            } else {
                displayHeight = Math.min(actualHeight, window.innerHeight - 200);
                displayWidth = displayHeight * imageRatio;
            }

            var left = (window.innerWidth - displayWidth) / 2;
            var top = (window.innerHeight - displayHeight) / 2;

            imgEl.style.left = left + 'px';
            imgEl.style.top = top + 'px';
            imgEl.style.width = displayWidth + 'px';
            imgEl.style.height = displayHeight + 'px';

            captionEl.style.left = left + 'px';
            captionEl.style.top = (top + displayHeight + 10) + 'px';
        });

        wrapperEl.addEventListener('click', function () {
            wrapperEl.parentNode.removeChild(wrapperEl);
        });

        document.body.appendChild(lightboxFrag)
        setTimeout(function() {
            wrapperEl.classList.add('pagespace-gallery-visible');
        },0);
    }

    document.getElementById(galleryId).addEventListener('click', function (ev) {
        if(ev.target.tagName === 'IMG') {
            var anchor = ev.target.parentNode;
            var src = anchor.getAttribute('href');
            var caption = ev.target.getAttribute('alt');
            launchLightbox(src, caption);
        }
        ev.preventDefault();
        ev.stopPropagation();
    });

    function matches(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector).call(el, selector);
    }
};