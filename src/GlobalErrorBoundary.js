import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    static getDerivedStateFromError(error) {
        return {error};
    }

    componentDidCatch(error, info) {
        // Customized error handling goes here!
    }

    render() {
        if (this.state.error) {
            console.error(this.state.error);
            return (
                <div>
                    <h1>Uh oh!</h1>
                    <p>Pokémon Finder has encountered this error at the following URL:</p>
                    <p className="error-message">{this.state.error.message}</p>
                    <p className="error-message">
                        {decodeURIComponent(window.location.href)}
                    </p>
                    <p>
                        Sorry about that! Trying refreshing the page, or press the back
                        button to go back to a previous state.
                    </p>
                    <p className="whisper">
                        To see more details about the error, open the console (F12).
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
