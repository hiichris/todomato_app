import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import  { TextNote } from "../components/TextNote";

describe("TextNote", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<TextNote />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
