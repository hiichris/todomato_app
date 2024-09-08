import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { NoAssignedTasks } from "../components/NoAssignTasks";


describe("NoAssignedTasks", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<NoAssignedTasks />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
