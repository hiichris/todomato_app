import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import  { ThumbnailImages } from "../components/ThumbnailImages";

describe("ThumbnailImages", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<ThumbnailImages />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
