import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import  { TodoDateTimePicker } from "../components/TodoDateTimePicker";

describe("TodoDateTimePicker", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TodoDateTimePicker />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
