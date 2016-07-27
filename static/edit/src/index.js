const createGalleryModel = require('./gallery-model');
const renderSelectTags = require('./select-tags-view');
const renderAvailableImagesView = require('./available-images-view');
const renderSelectedImagesView = require('./selected-images-view');

const galleryModel = createGalleryModel();
renderSelectTags(galleryModel);
renderAvailableImagesView(galleryModel);
renderSelectedImagesView(galleryModel);
galleryModel.start();

window.pagespace.on('save', function () {
    galleryModel.save();
});