import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text } from 'react-native-svg';
import { Task } from '../models/task';

const screenWidth = Dimensions.get('window').width * 0.78;
/* Ref:
d Attribute: The d attribute defines the path to be drawn. For example, M 50,50 L 0,50 A 50,50 0 0,1 50,0 Z defines a path starting from the center of the circle (M 50,50), drawing a line to the edge (L 0,50), then an arc (A 50,50 0 0,1 50,0), and finally closing the path (Z).
*/

const borderColor = "#FFCFBF";
const borderWidth = 8;
const circleCenter = 55;
const circleRadius = 50;
const textPositionX = circleCenter - circleRadius / 2;
const textPositionY = circleCenter - circleRadius / 2;

export function TaskPieChart({ tasks }) {
  const taskCount = tasks.length || 0;
  const defaultPieColor = "#FFEEE8";

  return (
    <View style={styles.container}>
      <Svg height={screenWidth} width={screenWidth} viewBox="0 0 110 110">
        {/* Border */}
        <Circle cx="55" cy="55" r="50" stroke={borderColor} strokeWidth={borderWidth} fill="none" />
        {/* Top-left quarter*/}
        <Path d="M 55,55 L 5,55 A 50,50 0 0,1 55,5 Z" fill={taskCount >= 1 ? "#DB3703" : defaultPieColor} />
        {/* Top-right quarter */}
        <Path d="M 55,55 L 55,5 A 50,50 0 0,1 105,55 Z" fill={taskCount >= 2 ? "#E34815" : defaultPieColor} />
        {/* Bottom-right quarter */}
        <Path d="M 55,55 L 105,55 A 50,50 0 0,1 55,105 Z" fill={taskCount >= 3 ? "#E55E32" : defaultPieColor} />
        {/* Bottom-left quarter */}
        <Path d="M 55,55 L 55,105 A 50,50 0 0,1 5,55 Z" fill={taskCount >= 4 ? "#E87853" : defaultPieColor} />

        {/* Text */}
        {taskCount >= 1 ?
          <Text x="35" y="35" fill="white" fontSize="8" textAnchor="middle">1</Text>
          : <View></View>
        }
        {taskCount >= 2 ?
          <Text x="75" y="35" fill="white" fontSize="8" textAnchor="middle">2</Text>
          : <View></View>
        }
        {taskCount >= 3 ?
          <Text x="75" y="80" fill="white" fontSize="8" textAnchor="middle">3</Text>
          : <View></View>
        }
        {taskCount >= 4 ?
          <Text x="35" y="80" fill="white" fontSize="8" textAnchor="middle">4</Text>
          : <View></View>
        }

      </Svg>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

