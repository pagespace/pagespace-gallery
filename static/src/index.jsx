(function() {

    /*******************************************************************************************************************
     * Model
     ******************************************************************************************************************/

    var stub = [
        {"_id": "56cdbbf087cf99674a99da7f", "updatedAt": "2016-02-24T14:19:28.140Z", "name": "Camel", "description": "undefined", "type": "image/jpeg", "fileName": "1-15020G00321619.jpg", "size": 76020, "width": 804, "height": 1005, "variations": [
            {"label": "thumb", "size": 7236, "width": 160, "height": 200, "_id": "56cdbbf087cf99674a99da80"}
        ], "createdAt": "2016-02-23T22:15:22.810Z", "tags": []},
        {"_id": "56cdbc0287cf99674a99da81", "updatedAt": "2016-02-24T14:19:46.761Z", "name": "Icon", "description": "undefined", "type": "image/png", "fileName": "37-browser-streamline-window.png", "size": 1013, "width": 96, "height": 96, "variations": [
            {"label": "thumb", "size": 3678, "width": 200, "height": 200, "_id": "56cdbc0287cf99674a99da82"}
        ], "createdAt": "2016-02-23T22:15:22.810Z", "tags": []},
        {"_id": "56cc5ec575b93b3624911b57", "updatedAt": "2016-02-23T13:29:41.283Z", "name": "Pagespace Avatar", "description": "Pagespace logo", "type": "image/png", "fileName": "avatar.png", "size": 6993, "width": 128, "height": 128, "variations": [
            {"label": "thumb", "size": 11730, "width": 200, "height": 200, "_id": "56cc5ec575b93b3624911b58"}
        ], "createdAt": "2016-02-23T13:29:38.483Z", "tags": [
            {"text": "pagespace"},
            {"text": "logo"}
        ]}
    ];

    // i did a talk recently where I argued that a Redux store is conceptually just an implementation of model as part of the MVC or MVP pattern
    //
    // One thing I don't like about working with Redux is, as a consumer (typically a view), the different parts (stores, reducers, actions, action creators etc)
    // are quite disperate. I wanted to get the benefits of using Redux but with a more cohesive interface to work with it.
    //
    // The solution I have is to wrap a Redux store with a domain specific class-based object. This keeps all the benefits that come with managing state
    // via Redux, but also providing a clear API surface to work with in views.
    //
    // It also implicitly solves a few problems people often encounter when working with Redux.
    //
    // Async operations
    //
    // Utility functions
    //
    // API
    //
    // Private actions and action creators
    //
    // Composition

    function createGalleryModel() {

        const galleryActions = {
            LOAD: 'LOAD',
            SELECT_IMAGES: 'SELECT_IMAGES',
            SELECT_IMAGE: 'SELECT_IMAGE',
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

            load(images)  {
                return this.store.dispatch({
                    type: galleryActions.LOAD,
                    images: images
                });
            }

            save() {
                return pagespace.setData({
                    images: this.selectedImages
                }).then(() => {
                    this.close();
                });
            }

            close() {
                pagespace.close();
            }

            start() {
                var allImages = fetch('/_api/media?type=' + encodeURIComponent('/^image/'), {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json'
                    }
                }).then((res) => {
                    if(res.status === 200) {
                        return res.json();
                    } else {
                        throw new Error(res.statusText);
                    }

                });

                //const allImages = Promise.resolve(stub);
                
                const pluginData = pagespace.getData();

                return Promise.all([allImages, pluginData]).then((values) => {
                    this.load(values[0]);
                    this.selectImages(values[1].images);
                }).catch(function(err) {
                    console.error(err);
                })
            }

            get images() {
                return this.store.getState().availableImages;
            }

            get selectedImages() {
                return this.store.getState().selectedImages;
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
                    if(image._id === action.image._id) {
                        image.selected = !image.selected;
                    }
                    return image;
                });
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
                if(action.image.selected) {
                    return state.concat(action.image);
                } else {
                    const removedImageIndex = state.findIndex((image) => image._id === action.image._id);
                    state.splice(removedImageIndex, 1);
                    return state.slice();
                }
            }
            if (action.type === galleryActions.SWAP_SELECTED_IMAGES) {
                var imageIndex = state.findIndex((image) => image._id === action.imageId);
                var otherImageIndex = state.findIndex((image) => image._id === action.otherImageId);

                if(imageIndex > -1 && otherImageIndex > -1) {
                    var swappedImages = state.slice();
                    swappedImages[imageIndex] = state[otherImageIndex];
                    swappedImages[otherImageIndex] = state[imageIndex];
                    return swappedImages;
                }
            }
            return state;
        };

        const reducer = Redux.combineReducers({
            availableImages: availableImagesReducer,
            selectedImages: selectedImagesReducer
        });
        const store = Redux.createStore(reducer, {});
        return new GalleryModel(store);
    }

    /*******************************************************************************************************************
     * Available images view
     ******************************************************************************************************************/

    function createAvailableImagesView(galleryModel) {
        const AvailableImage = React.createClass({
            render: function () {
                const toggleSelected = () => galleryModel.toggleSelected(this.props.image);
                const className = this.props.image.selected ? 'selected' : '';
                return (
                    <li className={className}>
                        <img src={`/_media/${this.props.image.fileName}?label=thumb`}
                             className={className}
                             onClick={toggleSelected} />
                    </li>
                );
            }
        });

        const AvailableImagesView = React.createClass({
            componentDidMount: function() {
                this.unsubscribe = galleryModel.subscribe(() =>  this.forceUpdate());
            },
            componentWillUnmount: function() {
                this.unsubscribe()
            },
            render: function () {
                const imageNodes = galleryModel.images.map((imageItem) => {
                    return (
                        <AvailableImage image={imageItem}
                                        key={imageItem._id}/>
                    )
                });

                return (
                    <div className="available-images">
                        {imageNodes.length > 0 ? imageNodes : <p>There are no images in the media library.</p>}
                    </div>
                )
            }
        });

        ReactDOM.render(
            <AvailableImagesView />,
            document.getElementById('gallery-available')
        );
    }

    /*******************************************************************************************************************
     * Selected images
     ******************************************************************************************************************/

    function createSelectedImagesView(galleryModel) {
        const SelectedImage = React.createClass({
            render: function () {
                const deselectImage = () => galleryModel.toggleSelected(this.props.image);

                const IMAGE_DRAG_TYPE = 'gallery/image';
                const isImageDrag = (ev) => ev.dataTransfer.types.indexOf(IMAGE_DRAG_TYPE) > -1;
                let currentDragTarget = null;

                const dragStart = (ev) => {
                    currentDragTarget = ev.target;
                    ev.dataTransfer.effectAllowed = 'move';
                    ev.dataTransfer.setData(IMAGE_DRAG_TYPE, this.props.image._id);
                };
                const dragEnter = (ev) => {
                    if(isImageDrag(ev) && ev.target !== currentDragTarget) {
                        ev.target.classList.add('swap-ready');
                    }
                };
                const dragLeave = (ev) => ev.target.classList.remove('swap-ready');
                const dragOver = (ev) => {
                    if(isImageDrag(ev)) {
                        ev.preventDefault();
                    }
                };
                const dragEnd = (ev) => currentDragTarget = null;
                const drop = (ev) => {
                    if(isImageDrag(ev)) {
                        ev.target.classList.remove('swap-ready');
                        var imageId = ev.dataTransfer.getData(IMAGE_DRAG_TYPE);
                        galleryModel.swapSelectedImages(this.props.image._id, imageId);
                    }
                };
                
                return (
                    <li>
                        <img src={`http://localhost:9999/_media/${this.props.image.fileName}?label=thumb`}
                             draggable="draggable"
                             onDragStart={dragStart}
                             onDragEnter={dragEnter}
                             onDragLeave={dragLeave}
                             onDragOver={dragOver}
                             onDragEnd={dragEnd}
                             onDrop={drop} />
                        <button className="remove-image" onClick={deselectImage} title="Remove">
                            <span className="glyphicon glyphicon-remove"></span>
                        </button>
                    </li>
                );
            }
        });

        const SelectedImagesView = React.createClass({
            componentDidMount: function() {
                this.unsubscribe = galleryModel.subscribe(() => this.forceUpdate() );
            },
            componentWillUnmount: function() {
                this.unsubscribe();
            },
            render: function () {
                const imageNodes = galleryModel.selectedImages.map((imageItem) => {
                    return (
                        <SelectedImage image={imageItem} key={imageItem._id} />
                    );
                });

                return (
                    <div className="selected-images">
                        <ul>
                            {imageNodes.length > 0 ? imageNodes : <p>There are no images in the media library.</p>}
                        </ul>
                    </div>
                );
            }
        });

        ReactDOM.render(
            <SelectedImagesView />,
            document.getElementById('gallery-selected')
        );
    }


    /*******************************************************************************************************************
     * Save button
     ******************************************************************************************************************/

    function createSaveButton(galleryModel) {
        const SaveButton = React.createClass({
            componentDidMount: function() {
                this.unsubscribe = galleryModel.subscribe( () => this.forceUpdate() );
            },
            componentWillUnmount: function() {
                this.unsubscribe();
            },
            render: function() {
                const save = () => {
                    galleryModel.save();
                };
                return <button className="btn btn-primary" onClick={save}>Save and close</button>;
            }
        });

        ReactDOM.render(
            <SaveButton/>,
            document.getElementById('header')
        );
    }

    /*******************************************************************************************************************
     * Controller
     ******************************************************************************************************************/

    const galleryModel = createGalleryModel();
    createAvailableImagesView(galleryModel);
    createSelectedImagesView(galleryModel);
    createSaveButton(galleryModel);

    galleryModel.start();

})();