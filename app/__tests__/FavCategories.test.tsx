import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import FavCategories from "../components/FavCategories";


describe("FavCategories", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<FavCategories />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
