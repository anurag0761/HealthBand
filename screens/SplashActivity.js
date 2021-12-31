import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-community/async-storage';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {askLocationPermission} from '../utils/permissions';

class SplashActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'Splash',
  };

  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.load);
    askLocationPermission();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHandle); // This is just necessary in the case that the screen is closed before the timeout fires, otherwise it would cause a memory leak that would trigger the transition regardless, breaking the user experience.
  }

  load = () => {
    BluetoothStateManager.getState().then((bluetoothState) => {
      switch (bluetoothState) {
        case 'Unknown':
          console.log('Unknown ===');
          break;
        case 'Resetting':
          console.log('Resetting ===');
          break;
        case 'Unsupported':
          console.log('Unsupported ===');
          break;
        case 'Unauthorized':
          console.log('Unauthorized ===');
          break;
        case 'PoweredOff':
          Alert.alert('', 'Please turn on your bluetooth', [
            // { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            {
              text: 'allow',
              onPress: () => {
                BluetoothStateManager.enable().then((result) => {
                  //   console.log('result====' + result)
                  // do something...

                  AsyncStorage.getItem('@is_login').then((isLogin) => {
                    if (isLogin == undefined || isLogin == '0') {
                      this.props.navigation.navigate('Login');
                    } else if (isLogin == '1') {
                      this.props.navigation.navigate('Dashboard');
                    }
                  });
                });
              },
            },
          ]);
          console.log('powered off===');
          break;
        case 'PoweredOn':
          this.showLoading();

          this.timeoutHandle = setTimeout(() => {
            //   Add your logic for the transition
            AsyncStorage.getItem('@is_login').then((isLogin) => {
              if (isLogin == undefined || isLogin == '0') {
                this.props.navigation.navigate('Login');
              } else if (isLogin == '1') {
                this.props.navigation.navigate('Dashboard');
              }
            });
          }, 4000);

          console.log('PoweredOn ===');
          break;

        default:
          break;
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.screentitle}>Smart Wristband</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0381CA',
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading_text: {
    fontSize: RFValue(10, 580),
    textAlign: 'center',
    color: '#FFC33B',
    fontWeight: 'bold',
  },
  screentitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SplashActivity;
