import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import stringsoflanguages from './locales/stringsoflanguages';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
var deviceId;

class LoginActivity extends Component {
  constructor(props) {
    super(props);
    this.loginCall = this.loginCall.bind(this);
    this.state = {
      phone: '',
      password: '',
      baseUrl: 'http://process.trackany.live/mobileapp/native/login.php?',
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'login',
  };

  CheckTextInput = () => {
    //Handler for the Submit onPress
    if (this.state.phone != '') {
      //Check for the Name TextInput
      if (this.state.password != '') {
        //Check for the Email TextInput
        // alert('Success');

        deviceId = DeviceInfo.getUniqueId();
        console.log('device id ===' + deviceId);
        this.showLoading();
        this.loginCall();
      } else {
        alert('Please Enter Password');
      }
    } else {
      alert('Please Enter Phone Number');
    }
  };

  componentDidMount() {}

  loginCall() {
    let formdata = new FormData();

    formdata.append('phone', this.state.phone);
    formdata.append('password', this.state.password);
    formdata.append('device_id', deviceId);
    formdata.append('type', 'fcm');

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

        console.log('response json===' + JSON.stringify(responseJson));

        if (responseJson.login.status == 'failed') {
          alert('Login Credentials are not correct, please check');
        } else {
          AsyncStorage.setItem('@is_login', '1');

          this.props.navigation.navigate('Dashboard');
        }
      })
      .catch((err) => {
        this.hideLoading();
        console.log('errrrr=======' + err);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0381CA',
            flex: 0.4,
            width: '100%',
          }}>
          <Text style={styles.screentitle}>Smart Wristband</Text>
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
          }}>
          <View style={styles.inputView}>
            <TextInput
              placeholder="Phone No."
              placeholderTextColor="#C3C8D1"
              underlineColorAndroid="transparent"
              style={styles.input}
              keyboardType="number-pad"
              onChangeText={(phone) => this.setState({phone})}
            />
          </View>

          <View style={styles.inputView1}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#C3C8D1"
              underlineColorAndroid="transparent"
              style={styles.input}
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}
            />
          </View>

          <TouchableOpacity
            style={styles.loginButtonStyle}
            activeOpacity={0.5}
            onPress={this.CheckTextInput}>
            <Text style={styles.buttonWhiteTextStyle}>Sign In</Text>
          </TouchableOpacity>

          {this.state.loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#0094CD" />
            </View>
          )}
        </View>
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
    color: '#0381CA',
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
    marginTop: 100,
    borderRadius: 10,
    elevation: 20,
    shadowColor: 'grey',
    elevation: 20,
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
    elevation: 20,
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  ImageIconStyle: {
    height: 25,
    width: 25,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStyle: {
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
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginActivity;
