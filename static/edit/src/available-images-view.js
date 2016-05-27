const React = require('react');
const ReactDOM = require('react-dom');

module.exports = function render(galleryModel) {
    const AvailableImage = React.createClass({
        render: function () {
            const toggleSelected = () => galleryModel.toggleSelected(this.props.image);
            const className = this.props.image.selected ? 'selected' : '';
            const selectedColor = window.localStorage.getItem('specialColor') || '#3FDAEF';
            return (
                <li className={className}>
                    <img src={`/_media/${this.props.image.fileName}?label=thumb`}
                         className={className}
                         style={{outlineColor: selectedColor}}
                         onClick={toggleSelected}/>
                </li>
            );
        }
    });

    const AvailableImagesView = React.createClass({
        componentDidMount: function () {
            this.unsubscribe = galleryModel.subscribe(() => this.forceUpdate());
        },
        componentWillUnmount: function () {
            this.unsubscribe()
        },
        render: function () {
            const selectedTags = galleryModel.selectedTags;
            const imageNodes = galleryModel.images
                .filter((image) => {
                    if(selectedTags.length === 0) {
                        return true;
                    }
                    for(let tag of image.tags) {
                        if(selectedTags.includes(tag.text)) {
                            return true;
                        }
                    }
                    return false;
                })
                .map((imageItem) => {
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
};