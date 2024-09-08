import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import AddTodoModal from "../components/AddTodoModal";


describe("AddTodoModal", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<AddTodoModal />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
