const React = require('react');
const ReactDOM = require('react-dom');
const Select = require('react-select');

module.exports = function render(galleryModel) {
    const SelectTags = React.createClass({
        componentDidMount: function() {
            this.unsubscribe = galleryModel.subscribe( () => this.forceUpdate() );
        },
        componentWillUnmount: function() {
            this.unsubscribe();
        },
        handleSelectChange (values) {
            const tags = values ? values.split(/\s/) : [];
            galleryModel.setTags(tags);
        },

        render: function() {
            const options = galleryModel.availableTags.map((tagText) => {
                return {
                    value: tagText,
                    label: tagText
                }
            });
            const value = galleryModel.selectedTags ? galleryModel.selectedTags.join(' ') : [];

            return <Select
                placeholder="Choose tags to filter by:"
                name="form-field-name"
                multi simpleValue
                value={value}
                delimiter=" "
                options={options}
                onChange={this.handleSelectChange}
            />;
        }
    });

    ReactDOM.render(
        <SelectTags/>,
        document.getElementById('tags')
    );
};