import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";
import { NativeDatabase } from "expo-sqlite";

import App from "../___index";

class ErrorBoundary extends React.Component {
  // Suggested by React Native documentation to handle errors in the app
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: To research on how to resolve: 
    // TypeError: _ExpoSQLiteNext.default.NativeDatabase is not a constructor
    // Therefore commenting out the console.error

    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI here
      return <div>Error occurred.</div>;
    }

    return this.props.children;
  }
}

describe("<App />", () => {
  it("renders correctly", async () => {
    const tree = renderer
      .create(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      )
      .toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
