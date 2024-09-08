import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import  { TodoItems } from "../components/TodoItems";

describe("TodoItems", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TodoItems />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
