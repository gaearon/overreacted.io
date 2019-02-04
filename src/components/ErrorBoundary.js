import React from 'react';

class Layout extends React.Component {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 310 }}>
          An unexpected error has occurred:
          <pre>{this.state.error.message}</pre>
          <a
            href="https://github.com/gaearon/overreacted.io/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Please file an issue here
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Layout;
