import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { TapButtons } from "../components/TapButtons";

describe("TapButtons", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TapButtons />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
