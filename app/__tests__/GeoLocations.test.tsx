import React from "react";
import renderer from "react-test-renderer";
import { waitFor } from "@testing-library/react-native";

import { GeoLocations } from "../components/GeoLocations";


describe("GeoLocations", () => {
  it("renders correctly", async () => {
    const tree = renderer.create(<GeoLocations />).toJSON();
    await waitFor(() => expect(tree).toMatchSnapshot());
  });
});
