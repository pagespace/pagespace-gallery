const createGalleryModel = require('./gallery-model');
const renderSelectTags = require('./select-tags-view');
const renderAvailableImagesView = require('./available-images-view');
const renderSelectedImagesView = require('./selected-images-view');

const galleryModel = createGalleryModel();
renderSelectTags(galleryModel);
renderAvailableImagesView(galleryModel);
renderSelectedImagesView(galleryModel);
galleryModel.start();

pagespace.on('save', function () {
    galleryModel.save().then(function() {
        pagespace.close();
    });
});