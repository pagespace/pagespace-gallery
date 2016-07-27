const Redux = require('redux');

const galleryActions = {
    LOAD: 'LOAD',
    SELECT_IMAGES: 'SELECT_IMAGES',
    SELECT_IMAGE: 'SELECT_IMAGE',
    SET_TAGS: 'SET_TAGS',
    TOGGLE_SELECTED: 'TOGGLE_SELECTED',
    SWAP_SELECTED_IMAGES: 'SWAP_SELECTED_IMAGES'
};

class ReduxWrapperModel {
    constructor(store) {
        this.store = store;
    }

    subscribe() {
        return this.store.subscribe(...arguments);
    }
}

class GalleryModel extends ReduxWrapperModel {
    selectImages(selectedImages) {
        return this.store.dispatch({
            type: galleryActions.SELECT_IMAGES,
            selectedImages: selectedImages
        });
    }

    toggleSelected(image) {
        this.store.dispatch({
            type: galleryActions.TOGGLE_SELECTED,
            image: image
        });
    }

    swapSelectedImages(imageId, otherImageId) {
        return this.store.dispatch({
            type: galleryActions.SWAP_SELECTED_IMAGES,
            imageId: imageId,
            otherImageId: otherImageId
        })
    }

    setTags(tagTexts) {
        return this.store.dispatch({
            type: galleryActions.SET_TAGS,
            selectedTags: tagTexts

        });
    }

    load(images) {
        return this.store.dispatch({
            type: galleryActions.LOAD,
            images: images
        });
    }

    save() {
        return pagespace.setData({
            images: this.selectedImages.map(image => {
                delete image.selected;
                return image;
            })
        });
    }
    
    start() {
        const allImages = fetch('/_api/media?type=' + encodeURIComponent('/^image/'), {
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json'
            }
        }).then((res) => {
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error(res.statusText);
            }

        });

        //const allImages = Promise.resolve(stub);

        const pluginData = pagespace.getData();

        return Promise.all([allImages, pluginData]).then((values) => {
            this.load(values[0]);
            this.selectImages(values[1].images || []);
        }).catch(function (err) {
            console.error(err);
        })
    }

    get images() {
        return this.store.getState().availableImages;
    }

    get selectedImages() {
        return this.store.getState().selectedImages;
    }

    get availableTags() {
        return this.store.getState().tags.available;
    }

    get selectedTags() {
        return this.store.getState().tags.selected;
    }
}

const availableImagesReducer = (state, action) => {
    if (typeof state === 'undefined') {
        return [];
    }

    if (action.type === galleryActions.LOAD) {
        return action.images;
    }

    if (action.type === galleryActions.SELECT_IMAGES) {
        const selectedImageIds = action.selectedImages.map((image) => image._id);
        return state.map((image) => {
            image.selected = selectedImageIds.indexOf(image._id) > -1;
            return image;
        });
    }

    if (action.type === galleryActions.TOGGLE_SELECTED) {
        return state.map(image => {
            if (image._id === action.image._id) {
                image.selected = !image.selected;
            }
            return image;
        });
    }

    return state;
};

const tagsReducer = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            available: [],
            selected: []
        };
    }

    if (action.type === galleryActions.LOAD) {
        const tagSets = action.images.map(function(image) {
            return image.tags;
        });
        
        const allTags = dedupeTags([].concat(...tagSets)).map(tag => tag.text);

        return {
            available: allTags,
            selected: []
        };
    }

    if(action.type == galleryActions.SET_TAGS) {
        return {
            available: state.available || [],
            selected: action.selectedTags
        };
    }

    return state;
};

const selectedImagesReducer = (state, action) => {
    if (typeof state === 'undefined') {
        return [];
    }

    if (action.type === galleryActions.SELECT_IMAGES) {
        return action.selectedImages;
    }

    if (action.type === galleryActions.TOGGLE_SELECTED) {
        if (action.image.selected) {
            return state.concat(action.image);
        } else {
            const removedImageIndex = state.findIndex((image) => image._id === action.image._id);
            state.splice(removedImageIndex, 1);
            return state.slice();
        }
    }
    if (action.type === galleryActions.SWAP_SELECTED_IMAGES) {
        const imageIndex = state.findIndex((image) => image._id === action.imageId);
        const otherImageIndex = state.findIndex((image) => image._id === action.otherImageId);

        if (imageIndex > -1 && otherImageIndex > -1) {
            const swappedImages = state.slice();
            swappedImages[imageIndex] = state[otherImageIndex];
            swappedImages[otherImageIndex] = state[imageIndex];
            return swappedImages;
        }
    }
    return state;
};

function dedupeTags(arr) {
    return arr.reduce((deduped, curr) => {
        if(!deduped.find(tag => tag.text === curr.text)) {
            deduped.push(curr);
        }
        return deduped;
    }, []);
}

module.exports = function createGalleryModel() {
    const reducer = Redux.combineReducers({
        tags: tagsReducer,
        availableImages: availableImagesReducer,
        selectedImages: selectedImagesReducer
    });
    const store = Redux.createStore(reducer, {});
    return new GalleryModel(store);
};