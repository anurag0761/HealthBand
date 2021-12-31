import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Picker,
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import stringsoflanguages from './locales/stringsoflanguages';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

var deviceId;

console.disableYellowBox = true;

class AddBluetoothDeviceActivity extends Component {
  constructor(props) {
    super(props);
    this.addBluetoothDevice = this.addBluetoothDevice.bind(this);
    this.state = {
      baseUrl: 'http://process.trackany.live/mobileapp/native/mBLEdevice.php?',
      name: '',
      mac_address: '',
      gender: '',
      date: '',
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'Add Device',
  };

  updategender = (gender) => {
    this.setState({gender: gender});
  };

  componentDidMount() {}

  CheckTextInput = () => {
    //Handler for the Submit onPress
    if (this.state.name != '') {
      //Check for the Name TextInput
      if (this.state.mac_address != '') {
        //Check for the Name TextInput
        if (this.state.date != '') {
          //check for phone number
          if (this.state.gender != '') {
            deviceId = DeviceInfo.getUniqueId();

            this.showLoading();
            this.addBluetoothDevice();
          } else {
            alert(stringsoflanguages.please_select_gender);
          }
        } else {
          alert(stringsoflanguages.please_select_dob);
        }
      } else {
        alert(stringsoflanguages.please_enter_mac_address);
      }
    } else {
      alert(stringsoflanguages.please_enter_name);
    }
  };

  addBluetoothDevice() {
    let formdata = new FormData();

    formdata.append('ble_name', this.state.name);
    formdata.append('ble_mac', this.state.mac_address);
    formdata.append('device_id', deviceId);
    formdata.append('dob', this.state.date);
    formdata.append('gender', this.state.gender);
    formdata.append('token', '1234');

    console.log('form data===' + JSON.stringify(formdata));
    console.log(' device id ===' + deviceId);

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
      .then(async (responseJson) => {
        this.hideLoading();

        AsyncStorage.setItem('@mac_address', this.state.mac_address);

        //   console.log("response json===" + JSON.stringify(responseJson))
        Toast.show(responseJson.setDeviceDetails, Toast.LONG);

        await this.setState({name: '', mac_address: '', gender: '', date: ''});

        this.props.navigation.navigate('BluetoothDeviceList');

        // alert(responseJson.setDeviceDetails);
      })
      .catch((err) => {
        this.hideLoading();
        console.log(err);
      });
    this.clearText();
  }

  clearText() {
    this.setState({name: ' '});
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.container}>
            <View
              style={{
                flexDirection: 'column',
                backgroundColor: '#0381CA',
                height: 50,
                width: '100%',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}>
              <View style={{flexDirection: 'row'}}>
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
                  <Text style={styles.screentitle}>Register your Device</Text>
                </View>

                <View style={{flex: 0.2}}></View>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              flex: 0.6,
              width: '100%',
              borderTopRightRadius: 30,
              borderTopLeftRadius: 30,
              marginTop: 20,
            }}>
            {/* <Text style={styles.signuptitle}>Register your Device</Text> */}

            <View style={styles.inputView}>
              <TextInput
                placeholder="Name of Device"
                placeholderTextColor="#C3C8D1"
                underlineColorAndroid="transparent"
                style={styles.input}
                onChangeText={(name) => this.setState({name})}
                //value={this.state.name}
              />
            </View>

            <View style={styles.inputView1}>
              <TextInput
                placeholder="mac-address of device"
                placeholderTextColor="#C3C8D1"
                underlineColorAndroid="transparent"
                style={styles.input}
                keyboardType="default"
                onChangeText={(mac_address) => this.setState({mac_address})}
              />
            </View>

            <View style={styles.inputView1}>
              <DatePicker
                style={{width: '100%', justifyContent: 'center'}}
                date={this.state.date}
                mode="date"
                placeholder="select date"
                format="DD-MM-YYYY"
                minDate="01-01-1920"
                maxDate="01-12-2050"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    right: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                }}
                onDateChange={(date) => {
                  this.setState({date: date});
                }}
              />
            </View>

            <View style={styles.inputView1}>
              <Picker
                style={styles.input}
                selectedValue={this.state.gender}
                onValueChange={this.updategender}>
                <Picker.Item label="Please Select Gender" value="" />
                <Picker.Item label="Male" value="1" />
                <Picker.Item label="Female" value="0" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.loginButtonStyle}
              activeOpacity={0.5}
              onPress={this.CheckTextInput}>
              <Text style={styles.buttonWhiteTextStyle}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  input: {
    color: 'black',
    width: 300,
    height: 50,
    padding: 10,
    textAlign: 'left',
    backgroundColor: 'transparent',
  },
  loginButtonStyle: {
    marginTop: 50,
    width: 250,
    height: 40,
    padding: 10,
    backgroundColor: '#0381CA',
    borderRadius: 5,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: 15,
    color: 'white',
    alignContent: 'center',
  },
  forgotpasswordtext: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    color: '#6F737A',
    marginRight: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  createnewaccounttext: {
    fontSize: RFPercentage(2),
    textAlign: 'center',
    color: '#6F737A',
    marginRight: 10,
    alignSelf: 'center',
  },
  signuptext: {
    fontSize: RFPercentage(2),
    textAlign: 'center',
    color: '#FB3954',
    marginRight: 10,
    fontWeight: 'bold',
    alignSelf: 'center',
  },

  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '90%',
    marginTop: 40,
    borderRadius: 10,
    elevation: 20,
    shadowColor: 'grey',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  inputView1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '90%',
    marginTop: 20,
    borderRadius: 10,
    elevation: 20,
    shadowColor: 'grey',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  ImageIconStyle: {
    height: 30,
    width: 25,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  MailIconStyle: {
    height: 25,
    width: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ImageLockIconStyle: {
    height: 32,
    width: 25,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screentitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  signuptitle: {
    color: '#3F434E',
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backIconStyle: {
    height: 25,
    width: 50,
    tintColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStyle: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddBluetoothDeviceActivity;
