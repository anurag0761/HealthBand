import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
import {Platform} from 'react-native';

export const askLocationPermission = async () => {
  if (Platform.OS === 'android') {
    let result = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ]);
    if (result['android.permission.ACCESS_FINE_LOCATION'] !== 'granted') {
      return false;
    } else {
      return true;
    }
  } else if (Platform.OS === 'ios') {
    let result = await requestMultiple([PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]);
    if (result['ios.permission.LOCATION_WHEN_IN_USE'] !== 'granted') {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};
