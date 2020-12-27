import React from 'react';

const ErrorContext = React.createContext(() => {
});

// Higher order component:
// adds handleApiError function to props of the component.
function withErrorHandler(WrappedComponent) {
  return class extends React.Component {
    render() {
      return (
        <ErrorContext.Consumer>
          {callbackFunction => (
            <WrappedComponent
              handleApiError={callbackFunction}
              {...this.props}
            />
          )}
        </ErrorContext.Consumer>
      );
    }
  };
}

function parseApiError(reason, redirect) {
  try {
    if (reason.response) {
      // get error code from server, all error codes must have localized versions in strings.js
      const errorCode = reason.response.data.response_error;
      redirect(errorCode);
    }
  } catch (error) {
    redirect('');
  }
}

export { ErrorContext, withErrorHandler, parseApiError };
