const createGalleryModel = require('./gallery-model');
const renderSelectTags = require('./select-tags-view');
const renderAvailableImagesView = require('./available-images-view');
const renderSelectedImagesView = require('./selected-images-view');
const renderSaveButton = require('./save-button-view');

const galleryModel = createGalleryModel();
renderSelectTags(galleryModel);
renderAvailableImagesView(galleryModel);
renderSelectedImagesView(galleryModel);
renderSaveButton(galleryModel);

galleryModel.start();
