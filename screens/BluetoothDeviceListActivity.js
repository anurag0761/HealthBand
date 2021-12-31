import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import {TemperatureContext} from '../contexts/TemperatureContext';

var deviceId, ble_mac;

function Item({item}) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listItemStyle}>
        <View style={{flex: 1, marginLeft: 10, padding: 10}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View
              style={{
                flex: 0.7,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'black', fontSize: RFValue(14, 580)}}>
                {item.ble_name}
              </Text>
            </View>

            <View
              style={{
                flex: 0.3,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../images/delete_icon.png')}
                style={styles.ImageIconStyle}
              />
            </View>
          </View>

          <Text style={{color: '#808080', fontSize: RFValue(12, 580)}}>
            {item.ble_mac}
          </Text>
          <Text style={{color: '#808080', fontSize: RFValue(12, 580)}}>
            {item.gender == 1 ? 'Male' : 'Female'}
          </Text>
          <Text
            style={{
              color: '#949494',
              alignSelf: 'flex-end',
              marginTop: 10,
              fontSize: RFPercentage(1.5),
            }}>
            {item.dob}
          </Text>
        </View>
      </View>
    </View>
  );
}

class BluetoothDeviceListActivity extends Component {
  constructor(props) {
    super(props);
    this.devicelist = this.devicelist.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
    this.state = {
      baseUrl: 'http://process.trackany.live/mobileapp/native/mBLEdevice.php?',
      isnoDataVisible: false,
      data: [],
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'Notification',
  };

  componentDidMount() {
    deviceId = DeviceInfo.getUniqueId();
    console.log('device id ===' + deviceId);
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.devicelist();
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  ListEmpty = () => {
    return (
      //View to show when list is empty
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        {this.state.isnoDataVisible ? (
          <Text style={{textAlign: 'center', alignSelf: 'center'}}>
            No Device Found
          </Text>
        ) : null}
      </View>
    );
  };

  actionOnRow(item) {
    ble_mac = item.ble_mac;

    Alert.alert(
      'Smart Wristband',
      'Are you sure you want to delete?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed!')},
        {text: 'Yes', onPress: () => this.deleteDevice(item)},
      ],
      {cancelable: false},
    );
  }

  devicelist() {
    let formdata = new FormData();

    formdata.append('device_id', deviceId);
    formdata.append('token', '1234');

    console.log('form data===' + JSON.stringify(formdata));

    var that = this;
    var url = that.state.baseUrl;
    console.log('url:' + url);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formdata,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.hideLoading();

        console.log(
          'response json===' + JSON.stringify(responseJson.getBLEDetailsList),
        );

        if (responseJson.getBLEDetailsList.length == '') {
          this.setState({isnoDataVisible: true});
        } else {
          this.setState({isnoDataVisible: false});
          this.setState({data: responseJson.getBLEDetailsList});
        }
      })
      .catch((err) => {
        this.hideLoading();
        console.log(err);
      });
  }

  deleteDevice(item) {
    let formdata = new FormData();

    formdata.append('device_id', deviceId);
    formdata.append('ble_mac', item.ble_mac);
    formdata.append('token', '1234');

    //  console.log('form data===' + JSON.stringify(formdata))

    var that = this;
    var url = that.state.baseUrl;
    console.log('url:' + url);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formdata,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.hideLoading();
        const clear = this.props.navigation.getParam('_clearInterval');
        clear();

        this.setState({isnoDataVisible: true});
        if (responseJson.deleteDeviceDetails == 'success') {
          AsyncStorage.removeItem('@mac_address');
          this.setState({
            data: this.state.data.filter((item) => item.ble_mac !== ble_mac),
          });
        } else {
          alert('some error occured');
        }

        console.log('response json===' + JSON.stringify(responseJson));
      })
      .catch((err) => {
        this.hideLoading();
        console.log(err);
      });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerView}>
          <TouchableOpacity
            style={{flex: 0.2}}
            onPress={() => {
              this.props.navigation.navigate('Dashboard');
            }}>
            <Image
              source={require('../images/back_icon.png')}
              style={styles.backIconStyle}
            />
          </TouchableOpacity>

          <View style={{flex: 0.6}}>
            <Text style={styles.screentitle}>Device List</Text>
          </View>

          <View style={{flex: 0.2, marginTop: 5}}>
            <TouchableOpacity
              style={{
                flex: 0.4,
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
              onPress={() => {
                if (this.state.data.length > 0) {
                  alert('You can add only one device');
                } else {
                  this.props.navigation.navigate('AddBluetoothDevice');
                }
              }}>
              <Text style={styles.add_device_text}>ADD DEVICE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1}}
          data={this.state.data}
          renderItem={({item}) => (
            <TouchableWithoutFeedback onPress={() => this.actionOnRow(item)}>
              <View>
                <Item item={item} />
              </View>
            </TouchableWithoutFeedback>
          )}
          keyExtractor={(item) => item.time}
          ListEmptyComponent={this.ListEmpty}
        />

        {/* </ScrollView> */}
      </SafeAreaView>
    );
  }
}

BluetoothDeviceListActivity.contextType = TemperatureContext;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FE',
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
  listItem: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column',
  },
  bottomactivetextstyle: {
    color: '#FB3954',
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
    color: '#0081C9',
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
  listItemStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    margin: 10,
    elevation: 20,
    shadowColor: 'grey',
    borderRadius: 5,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  backIconStyle: {
    height: 25,
    width: 50,
    tintColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  add_device_text: {
    color: 'white',
    fontSize: 8,
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  circle: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    borderRadius: 150 / 2,
    backgroundColor: '#F29600',
  },
  activetabStyle: {
    marginTop: 10,
    flex: 0.5,
    height: 40,
    margin: 5,
    backgroundColor: '#0081C9',
    borderRadius: 2,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  inactivetabStyle: {
    marginTop: 10,
    flex: 0.5,
    height: 40,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#0081C9',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  activeTabTextStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    alignContent: 'center',
  },
  inactiveTabTextStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#0081C9',
    alignContent: 'center',
  },
  ImageIconStyle: {
    marginTop: 3,
    height: 20,
    width: 20,
    tintColor: '#0081C9',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BluetoothDeviceListActivity;
