import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import  { TodoDetails } from "../components/TodoDetails";

describe("TodoDateTimePicker", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TodoDetails />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
