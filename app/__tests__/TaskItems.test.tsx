import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { TaskItems } from "../components/TaskItems";

describe("TaskItems", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TaskItems />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
