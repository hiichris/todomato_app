import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { RadioButton } from "../components/RadioButton";

describe("RadioButton", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<RadioButton />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
