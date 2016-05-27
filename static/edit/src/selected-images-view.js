const React = require('react');
const ReactDOM = require('react-dom');

module.exports = function render(galleryModel) {
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
                    <img src={`/_media/${this.props.image.fileName}?label=thumb`}
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
                <div>
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
};