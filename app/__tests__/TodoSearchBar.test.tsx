import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { TodoSearchBar } from "../components/TodoSearchBar";

describe("TodoSearchBar", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TodoSearchBar />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
