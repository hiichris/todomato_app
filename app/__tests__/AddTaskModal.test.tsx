import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import AddTaskModal from "../components/AddTaskModal";

describe("AddTaskModal", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<AddTaskModal />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
