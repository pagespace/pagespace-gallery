const React = require('react');
const ReactDOM = require('react-dom');

module.exports = function render(galleryModel) {
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
        document.getElementById('save')
    );
};