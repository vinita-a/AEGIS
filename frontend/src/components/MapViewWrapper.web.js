import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';

const MapView = forwardRef(({ children }, ref) => {
  useImperativeHandle(ref, () => ({
    animateCamera: () => {},
    fitToCoordinates: () => {},
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#9E7A80', fontSize: 14, textAlign: 'center' }}>
        Map preview is not available on web in this version.
      </Text>
      {children}
    </View>
  );
});

const Circle = () => null;
const Marker = () => null;
const Polyline = () => null;
const PROVIDER_GOOGLE = null;

export { MapView, Circle, Marker, Polyline, PROVIDER_GOOGLE };
