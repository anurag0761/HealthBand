/* eslint-disable no-shadow */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-dupe-class-members */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  YellowBox,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {RFValue} from 'react-native-responsive-fontsize';

import stringsoflanguages from '../screens/locales/stringsoflanguages';
//import our Custom menu component
import CustomMenuIcon from './custommenu/CustomMenuIcon';
import Eddystone from '@lg2/react-native-eddystone';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundJob from 'react-native-background-actions';
//import Geolocation from 'react-native-geolocation-service';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import firebase from 'react-native-firebase';
import {TemperatureContext} from '../contexts/TemperatureContext';

let strdata = '';
var data = [];
var deviceId;

YellowBox.ignoreWarnings(['']);

const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

const taskRandom = async (taskData) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
    );
  }
  await new Promise(async (resolve) => {
    // For loop with a delay
    const {delay} = taskData;
    for (let i = 0; BackgroundJob.isRunning(); i++) {
      try {
      } catch (e) {
        console.log(e);
      }

      //   console.log('Runned -> ', i);
      //  await BackgroundJob.updateNotification({taskDesc: 'Runned -> ' + i});
      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'Example',
  taskTitle: 'Health Band',
  taskDesc: 'Background Service running',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#0081C9',
  // linkingURI: 'exampleScheme://chat/jane',
  parameters: {
    delay: 1000 * 60,
  },
};

class DashboardActivity extends Component {
  playing = BackgroundJob.isRunning();

  constructor(props) {
    super(props);
    this.devicelist = this.devicelist.bind(this);
    this.onTelemetry = this.onTelemetry.bind(this);
    this.callApi = this.callApi.bind(this);

    this.state = {
      data: {
        device_address: '',
        rssi: '',
        dir: 1,
        temp: '',
        heart_rate: '',
        oxygen: '',
        date: '',
      },
      date: '',
      url:
        'http://process.trackany.live/asset_process/device_received_data_eddystone.php?SubscriberName=Zone/',
      devicelisturl:
        'http://process.trackany.live/mobileapp/native/mBLEdevice.php?',
      dashboardurl:
        'http://process.trackany.live/mobileapp/native/getNotifications.php?',
      temp: '',
      heartRate: '',
      oxygen: '',
      notified: false,
      notificationTimeOut: 0,
      devices: [],
      strData: '',
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'Dashboard',
  };

  componentDidMount = async () => {
    this.focusListener = this.props.navigation.addListener(
      'didFocus',
      async () => {
        deviceId = DeviceInfo.getUniqueId();

        console.log('DEVICE ID', deviceId);

        await this.devicelist();

        AsyncStorage.getItem('@temp').then((temp) => {
          if (temp) {
            this.setState({temp: temp});
            // console.log('temp data ====' + this.state.temp);
          }
        });

        AsyncStorage.getItem('@heartRate').then((heartRate) => {
          //console.log('heart rate===' + heartRate);
          if (heartRate) {
            this.setState({heartRate: heartRate});
            //console.log('heartRate ====' + this.state.heartRate);
          }
        });

        AsyncStorage.getItem('@oxygen').then((oxygen) => {
          if (oxygen) {
            this.setState({oxygen: oxygen});
            //console.log('oxygen ====' + this.state.oxygen);
          }
        });

        await BluetoothStateManager.getState().then(async (bluetoothState) => {
          switch (bluetoothState) {
            case 'Unknown':
              //  console.log('Unknown ===');
              break;
            case 'Resetting':
              // console.log('Resetting ===');
              break;
            case 'Unsupported':
              //  console.log('Unsupported ===');
              break;
            case 'Unauthorized':
              //   console.log('Unauthorized ===');
              break;
            case 'PoweredOff':
              //  console.log('powered off===');
              break;
            case 'PoweredOn':
              //  console.log('PoweredOn ===');

              if (this.state.devices.length > 0) {
                if (!this.interval) {
                  await Eddystone.removeListener(
                    'onTelemetryFrame',
                    this.onTelemetry,
                  );
                  await BackgroundJob.stop();

                  Eddystone.addListener('onTelemetryFrame', this.onTelemetry);
                  this.showLoading();
                  Toast.show('scanning started', Toast.LONG);
                  Eddystone.startScanning();

                  try {
                    this.interval = setInterval(async () => {
                      if (this.state.strData !== '') {
                        if (
                          this.state.devices[0].ble_mac.toLowerCase() ===
                          this.state.data.device_address
                        ) {
                          this.callApi();
                          this.setState({strData: ''});
                        }
                      }
                    }, 1000 * 60 * 1);
                  } catch (e) {
                    console.log(e);
                  }
                }
              } else {
                Toast.show('please add atleast one device to scan', Toast.LONG);
              }

              break;

            default:
              break;
          }
        });

        this.playing = !this.playing;
        if (this.playing) {
          try {
            //console.log('Trying to start background service');
            BackgroundJob.start(taskRandom, options);

            // console.log('Successful start!');
          } catch (e) {
            console.log('Error', e);
          }
        }
      },
    );
    /// NOTIFICATION ONCLICK LISTENER @YASHPK&789987
    this.notificationListener = await firebase
      .notifications()
      .onNotificationOpened((_) => {
        // const {title, body} = notificationOpen.notification;
        firebase.notifications().removeAllDeliveredNotifications();
        this.props.navigation.navigate('Notification');
      });
    /// NOTIFICATION  ONCLICK LISTENER @YASHPK&789987
  };

  clearInterval = async () => {
    Eddystone.removeListener('onTelemetryFrame', this.onTelemetry);
    clearInterval(this.interval);
    this.interval = undefined;
  };

  componentWillUnmount() {
    // REMOVING ON CLICK LISTENER
    this.notificationListener();
    this.focusListener.remove();
  }

  ///// DO NOT MODIFY THIS FUNCTION @YASHPK789987
  notify = async () => {
    try {
      const notification22 = new firebase.notifications.Notification()
        .setNotificationId('notificationId')
        .setTitle('Health Band')
        .setBody('it seems that your temperature is going high.')
        .setSound('default')
        .android.setColor('#0081C9')
        .android.setPriority(firebase.notifications.Android.Priority.Max)
        .android.setChannelId('test-channel');
      await firebase.notifications().displayNotification(notification22);

      this.setState({notified: true, notificationTimeOut: 0});
    } catch (error) {
      console.log(error);
    }
  };
  ///// DO NOT MODIFY THIS FUNCTION @YASHPK789987

  saveNotification = (mac, temp, heart, oxygen, date) => {
    console.log(mac, temp, heart, oxygen, date);
    const url = `http://process.trackany.live/mobileapp/native/notifications.php?type=temp&&ble_mac=${mac}&&ble_temp=${temp}&&ble_heart_rate=${heart}&&ble_blood_oxygen=${oxygen}&&notification_dt=${date}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  };

  async onTelemetry(telemetry) {
    var str1 = telemetry.result.replace('ScanResult{', '');
    let str2 = str1.replace('mDevice=', '');
    let str3 = str2.replace(',', '');
    var str4 = str3.split(' ');
    var str5 = str4[0].split('=')[1];
    // console.log('hello', str5);
    // console.log(str5, 'MAC');
    // console.log(str5.toLowerCase());
    // console.log(this.state.devices[0].ble_mac.toLowerCase());
    // console.log(
    //   this.state.devices[0].ble_mac.toLowerCase() === str5.toLowerCase(),
    // );

    var str6 = str4[21];

    var str7 = str6.replace('rssi=', '');

    let rssi = str7.replace(',', '');

    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds

    var date_new =
      year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec;

    // console.log("data ==== " + JSON.stringify(data))

    if (this.state.devices[0].ble_mac.toLowerCase() === str5.toLowerCase()) {
      if (
        this.context.store.temperature !== undefined &&
        parseInt((telemetry.tempnew * 9) / 5 + 32) >
          parseInt(this.context.store.temperature) &&
        !this.state.notified &&
        this.state.notificationTimeOut >= 15
      ) {
        this.notify();
        this.saveNotification(
          str5.toLowerCase(),
          telemetry.tempnew,
          telemetry.heart_rate,
          telemetry.oxygen,
          date_new,
        );
      }
      await this.setState({
        data: {
          device_address: str5.toLowerCase(),
          rssi: rssi,
          dir: 1,
          temp: telemetry.tempnew,
          heart_rate: telemetry.heart_rate,
          oxygen: telemetry.oxygen,
          date: date_new,
        },
      });

      var tempinf = (parseInt(this.state.data.temp) * 9) / 5 + 32;

      this.setState({temp: tempinf.toString()});
      this.setState({heartRate: this.state.data.heart_rate});
      this.setState({oxygen: this.state.data.oxygen});

      // console.log(this.state.data.rssi, 'RSSIS');

      AsyncStorage.setItem('@temp', tempinf.toString());
      AsyncStorage.setItem('@heartRate', this.state.data.heart_rate.toString());
      AsyncStorage.setItem('@oxygen', this.state.data.oxygen.toString());

      const strdata =
        '|' +
        this.state.data.device_address +
        ',' +
        this.state.data.rssi +
        ',' +
        this.state.data.dir +
        ',' +
        this.state.data.temp +
        ',' +
        this.state.data.heart_rate +
        ',' +
        this.state.data.oxygen +
        ',' +
        this.state.data.date;
      this.setState({strData: strdata});
    }

    // console.log("strdata ====" + JSON.stringify(strdata));
  }

  callApi() {
    // console.log("strdata in api====" + JSON.stringify(strdata));
    var url = this.state.url + deviceId;

    //  console.log(this.state.strData, 'API CALLING');
    console.log(url);
    console.log(this.state.strData);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': '',
      },
      body: this.state.strData,
    })
      .then((response) => response)
      .then((responseData) => {
        console.log(responseData);
        Toast.show('API IS CALLING' + JSON.stringify(responseData));
        this.hideLoading();
        this.setState({
          notified: false,
          notificationTimeOut: this.state.notificationTimeOut + 1,
        });
      })
      .catch((error) => {
        this.hideLoading();
        console.log('error:', error);
      })
      .done();
  }

  componentWillUnmount() {
    //Eddystone.stopScanning();
  }

  async devicelist() {
    let formdata = new FormData();

    formdata.append('device_id', deviceId);
    formdata.append('token', '1234');

    //console.log('form data===' + JSON.stringify(formdata));

    var that = this;
    var url = that.state.devicelisturl;
    // console.log('url:' + url);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formdata,
      });
      const responseJson = await res.json();
      if (responseJson.getBLEDetailsList.length === 0) {
        await this.setState({isnoDataVisible: true, devices: []});
      } else {
        await this.setState({isnoDataVisible: false});
        await this.setState({devices: responseJson.getBLEDetailsList});
        AsyncStorage.setItem(
          '@mac_address',
          responseJson.getBLEDetailsList[0].ble_mac,
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Toggles the background task
   */
  toggleBackground = async () => {
    this.playing = !this.playing;
    if (this.playing) {
      try {
        // await BackgroundJob.stop();
        //    console.log('Trying to start background service');
        //  await BackgroundJob.start(taskRandom, options);
        //    console.log('Successful start!');
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      // console.log('Stop background service');
      await BackgroundJob.stop();
    }
  };

  render() {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerView}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 0.2,
              }}></View>

            <TouchableOpacity
              //  onPress={this.toggleBackground}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 0.6,
              }}>
              {/* <Text style={styles.screentitle}>{deviceId}</Text> */}

              <Text style={styles.screenHeading}>Smart Wristband</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 0.2,
              }}>
              <CustomMenuIcon
                //Menu Text
                menutext="Menu"
                //Menu View Style
                menustyle={{
                  marginRight: 5,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
                //Menu Text Style
                textStyle={{
                  color: 'white',
                }}
                //Click functions for the menu items
                option1Click={() => {
                  this.props.navigation.navigate('AddBluetoothDevice');
                }}
                option2Click={() => {
                  this.props.navigation.navigate('BluetoothDeviceList', {
                    _clearInterval: this.clearInterval,
                  });
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <View style={styles.row}>
              <View style={styles.tempbox}>
                <View
                  style={{
                    flex: 0.2,
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: '#F5AB3F',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={styles.boxtitle}>Temprature</Text>
                </View>

                <View
                  style={{
                    flex: 0.8,
                    flexDirection: 'row',
                    backgroundColor: '#F29600',
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}>
                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/thermometer.png')}
                      style={styles.iconstyle}
                    />
                  </View>

                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Text style={styles.screentitle}>{this.state.temp} F</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.heartbox}>
                <View
                  style={{
                    flex: 0.2,
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: '#F67A96',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={styles.boxtitle}>Heart Rate</Text>
                </View>

                <View
                  style={{
                    flex: 0.8,
                    flexDirection: 'row',
                    backgroundColor: '#EE3364',
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}>
                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/cardiogram.png')}
                      style={styles.iconstyle}
                    />
                  </View>

                  {/* <View
                                    style={{
                                        borderLeftWidth: 1,
                                        borderLeftColor: 'white',
                                    }}
                                /> */}

                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Text style={styles.screentitle}>
                      {this.state.heartRate} bpm
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.blodbox}>
                <View
                  style={{
                    flex: 0.2,
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: '#FD835E',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={styles.boxtitle}>Blood Oxygen SPO2</Text>
                </View>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: 'row',
                    backgroundColor: '#FB6230',
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}>
                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/blood-drop.png')}
                      style={styles.iconstyle}
                    />
                  </View>

                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Text style={styles.screentitle}>{this.state.oxygen}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tabStyle}>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('Dashboard');
              }}>
              <Image
                source={require('../images/home_active.png')}
                style={styles.StyleHomeTab}
              />

              <Text style={styles.bottomactivetextstyle}>
                {stringsoflanguages.Home}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('TempratureHistoryTab');
              }}>
              <Image
                source={require('../images/history_inactive-2.png')}
                style={styles.StyleVideoTab}
              />

              <Text style={styles.bottomvideotextstyle}>
                {stringsoflanguages.my_videos}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('Notification');
              }}>
              <Image
                source={require('../images/bell_inactive.png')}
                style={styles.styleNotificationTab}
              />

              <Text style={styles.bottomnotificationtextstyle}>
                {stringsoflanguages.notification_small}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('Settings');
              }}>
              <Image
                source={require('../images/setting_inactive.png')}
                style={styles.StyleProfileTab}
              />

              <Text style={styles.bottominactivetextstyle}>
                {stringsoflanguages.settings}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FE',
    flexDirection: 'column',
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
  thermometer_box: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    flex: 0.3,
    backgroundColor: '#F29600',
    alignSelf: 'center',
    flexDirection: 'column',
  },
  bottomactivetextstyle: {
    color: '#0081C9',
    fontSize: 8,
    marginTop: 5,
    textAlign: 'center',
  },
  bottominactivetextstyle: {
    color: '#887F82',
    fontSize: 8,
    marginTop: 3,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    tintColor: '#0081C9',
    justifyContent: 'center',
  },
  StyleVideoTab: {
    marginTop: 5,
    width: 38,
    height: 35,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomvideotextstyle: {
    color: '#887F82',
    fontSize: 8,
    marginTop: 3,
    textAlign: 'center',
  },
  styleNotificationTab: {
    marginTop: 9,
    width: 25,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomnotificationtextstyle: {
    color: '#887F82',
    fontSize: 8,
    marginTop: 3,
    textAlign: 'center',
  },
  StyleProfileTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    height: 60,
    margin: 5,
    shadowColor: '#ecf6fb',
    elevation: 20,
    shadowColor: 'grey',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#0081C9',
  },
  screentitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  screenHeading: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  CircleShapeView: {
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    marginBottom: 50,
    backgroundColor: 'white',
    shadowColor: '#ecf6fb',
    elevation: 20,
    shadowColor: 'grey',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  plusiconstyle: {
    height: 30,
    width: 30,
    marginTop: 60,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBottomView: {
    height: 50,
    width: 400,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    shadowColor: '#ecf6fb',
    elevation: 20,
    shadowColor: 'grey',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  textblacktextstyle: {
    fontSize: 15,
    color: '#1B273E',
    fontWeight: 'bold',
  },
  textpinktextstyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FB3954',
    textAlign: 'right',
    marginRight: 3,
  },
  playiconstyle: {
    height: 70,
    width: 70,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  box: {
    flex: 1,
    height: 100,
    backgroundColor: '#333',
  },
  tempbox: {
    backgroundColor: '#F29600',
    flexDirection: 'column',
    flex: 1,
    margin: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heartbox: {
    backgroundColor: '#EE3364',
    flex: 1,
    margin: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  blodbox: {
    backgroundColor: '#FB6230',
    flex: 1,
    margin: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  boxtitle: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
    textAlign: 'center',
  },
  iconstyle: {
    height: 70,
    width: 70,
    tintColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verticalline: {
    backgroundColor: 'white',
  },
  o2title: {
    color: 'white',
    fontSize: 100,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  o2text: {
    color: 'white',
    fontSize: 20,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
});

DashboardActivity.contextType = TemperatureContext;

export default DashboardActivity;
