import React from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import SplashActivity from './screens/SplashActivity';
import LoginActivity from './screens/LoginActivity';
import SignupActivity from './screens/SignupActivity';
import DashboardActivity from './screens/DashboardActivity';
import NotificationActivity from './screens/NotificationActivity';
import TempratureHistoryTabActivity from './screens/HistoryTabs/TempratureHistoryTab';
import InteractionHistoryTabActivity from './screens/HistoryTabs/InteractionHistoryTab';
import AddBluetoothDeviceActivity from './screens/AddBluetoothDeviceActivity';
import BluetoothDeviceListActivity from './screens/BluetoothDeviceListActivity';
import SettingsActivity from './screens/SettingsActivity';

import {Platform} from 'react-native';
import firebase from 'react-native-firebase';
import {TemperatureContext} from './contexts/TemperatureContext';

const NavStack = createStackNavigator(
  {
    Splash: {screen: SplashActivity},
    Login: {screen: LoginActivity},
    Signup: {screen: SignupActivity},
    Dashboard: {screen: DashboardActivity},
    Notification: {screen: NotificationActivity},
    TempratureHistoryTab: {screen: TempratureHistoryTabActivity},
    InteractionHistoryTab: {screen: InteractionHistoryTabActivity},
    AddBluetoothDevice: {screen: AddBluetoothDeviceActivity},
    BluetoothDeviceList: {screen: BluetoothDeviceListActivity},
    Settings: {screen: SettingsActivity},
  },
  {
    initialRouteName: 'Splash',
    headerMode: 'none',
  },
);

const Apps = createAppContainer(NavStack);

export default class App extends React.Component {
  state = {
    temperature: undefined,
  };
  createAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      const channel = new firebase.notifications.Android.Channel(
        'test-channel',
        'Test Channel',
        firebase.notifications.Android.Importance.Max,
      ).setDescription('My apps test channel');
      firebase.notifications().android.createChannel(channel);
    }
  };

  componentDidMount = async () => {
    await this.createAndroidChannel();
    this.LoadTemp();
  };

  LoadTemp = () => {
    var url =
      'http://process.trackany.live/mobileapp/native/settings.php?org_id=1';

    fetch(url, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        const tempinf = (parseInt(responseJson[0].temp_high) * 9) / 5 + 32;
        this.setState({temperature: tempinf});
      })
      .catch((err) => {
        this.hideLoading();
        console.log(err);
      });
  };

  setStore = (t) => {
    this.setState({temperature: t});
  };

  render() {
    return (
      <TemperatureContext.Provider
        value={{
          store: {temperature: this.state.temperature},
          setStore: this.setStore,
        }}>
        <Apps />
      </TemperatureContext.Provider>
    );
  }
}
