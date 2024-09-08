import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { TaskPieChart } from "../components/TaskPieChart";

describe("TaskPieChart", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TaskPieChart />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
