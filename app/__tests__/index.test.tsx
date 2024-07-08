
import React from 'react';
import renderer from 'react-test-renderer';
import { waitFor } from '@testing-library/react-native';

import App from '../index';

describe('<App />', () => {
  it('has 1 child', async () => {
    
    await waitFor(()=> {
        const tree = renderer.create(<App />).toJSON();
        jest.runOnlyPendingTimers();
        expect (tree).toMatchSnapshot();
    });
  });
});
