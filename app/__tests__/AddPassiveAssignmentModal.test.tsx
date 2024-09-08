import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import AddPassiveAssignmentModal from "../components/AddPassiveAssignmentModal";


describe("AddPassiveAssignmentModal", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<AddPassiveAssignmentModal />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
